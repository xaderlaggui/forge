const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

const files = project.getSourceFiles().filter(f => 
  !f.getFilePath().includes('node_modules') && 
  (f.getFilePath().endsWith('.tsx') || f.getFilePath().endsWith('.ts'))
);

for (const sourceFile of files) {
  // Skip settings.tsx since it's already hand-tuned
  if (sourceFile.getFilePath().includes('settings.tsx')) continue;

  let hasForgeThemeImport = false;
  let tIdentifier = 'T'; // Default to 'T' but check what it's imported as
  
  const imports = sourceFile.getImportDeclarations();
  let forgeThemeImportDecl = null;
  
  for (const imp of imports) {
    if (imp.getModuleSpecifierValue().includes('ForgeTheme')) {
      hasForgeThemeImport = true;
      forgeThemeImportDecl = imp;
      
      const namedImports = imp.getNamedImports();
      for (const named of namedImports) {
        if (named.getName() === 'ForgeTheme') {
          if (named.getAliasNode()) {
            tIdentifier = named.getAliasNode().getText();
          } else {
            tIdentifier = 'ForgeTheme';
          }
        }
      }
    }
  }

  if (!hasForgeThemeImport) continue;

  console.log('Processing:', sourceFile.getFilePath());

  // Add useForgeTheme import
  let useForgeImport = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue().includes('useForgeTheme'));
  if (!useForgeImport) {
    sourceFile.addImportDeclaration({
      namedImports: ['useForgeTheme'],
      moduleSpecifier: '@/hooks/useForgeTheme'
    });
  }

  // Refactor StyleSheet.create
  let stylesheetName = null;
  const varDecls = sourceFile.getVariableDeclarations();
  for (const vd of varDecls) {
    const init = vd.getInitializer();
    if (init && init.getKind() === SyntaxKind.CallExpression && init.getText().startsWith('StyleSheet.create')) {
      stylesheetName = vd.getName(); // e.g. "styles" or "s"
      const newName = 'use' + stylesheetName.charAt(0).toUpperCase() + stylesheetName.slice(1);
      
      vd.rename(newName);
      vd.setInitializer(`(T: any) => ${init.getText()}`);
    }
  }

  // Find all React components
  const functions = [...sourceFile.getFunctions(), ...sourceFile.getVariableDeclarations().map(vd => {
    if (vd.getInitializer() && (vd.getInitializer().getKind() === SyntaxKind.ArrowFunction || vd.getInitializer().getKind() === SyntaxKind.FunctionExpression)) {
      return vd.getInitializer();
    }
    return null;
  }).filter(Boolean)];

  for (const fn of functions) {
    let name = '';
    if (fn.getKind() === SyntaxKind.FunctionDeclaration) {
      name = fn.getName() || '';
    } else {
      name = fn.getParent().getName() || '';
    }
    
    // Check if it's a component (starts with uppercase)
    if (name && /^[A-Z]/.test(name)) {
      const body = fn.getBody();
      if (body && body.getKind() === SyntaxKind.Block) {
        // Only insert if it doesn't already have it
        if (!body.getText().includes('useForgeTheme()')) {
          body.insertStatements(0, `const { T } = useForgeTheme();`);
          if (stylesheetName) {
            const hookName = 'use' + stylesheetName.charAt(0).toUpperCase() + stylesheetName.slice(1);
            body.insertStatements(1, `const ${stylesheetName} = ${hookName}(T);`);
          }
        }
      }
    }
  }

  // If T was originally aliased to something else, we need to ensure the destructure creates that alias
  // but useForgeTheme returns { T }. So we change `const { T } = useForgeTheme()` to `const { T: ForgeTheme }` if needed.
  // Actually, we just enforce the destructure string based on the old identifier.
  const components = sourceFile.getFunctions().filter(f => f.getName() && /^[A-Z]/.test(f.getName()));
  for (const comp of components) {
    const body = comp.getBody();
    if (body && body.getKind() === SyntaxKind.Block) {
       let stmts = body.getStatements();
       let useThemeStmt = stmts.find(s => s.getText().includes('useForgeTheme()'));
       if (useThemeStmt && tIdentifier !== 'T') {
          useThemeStmt.replaceWithText(`const { T: ${tIdentifier} } = useForgeTheme();`);
       }
    }
  }

  // Finally remove the old ForgeTheme import
  if (forgeThemeImportDecl) {
    forgeThemeImportDecl.remove();
  }
}

project.saveSync();
console.log('Done!');
