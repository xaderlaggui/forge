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
  if (sourceFile.getFilePath().includes('useForgeTheme.ts')) continue;
  if (sourceFile.getFilePath().includes('ForgeTheme.ts')) continue;

  let hasForgeThemeImport = false;
  let tIdentifier = 'T'; 
  
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

  // Refactor StyleSheet.create to useStyles = (T: any) => StyleSheet.create
  let stylesheetName = null;
  const varDecls = sourceFile.getVariableDeclarations();
  for (const vd of varDecls) {
    const init = vd.getInitializer();
    if (init && init.getKind() === SyntaxKind.CallExpression && init.getText().startsWith('StyleSheet.create')) {
      stylesheetName = vd.getName();
      const newName = 'use' + stylesheetName.charAt(0).toUpperCase() + stylesheetName.slice(1);
      vd.rename(newName);
      vd.setInitializer(`(T: any) => ${init.getText()}`);
    }
  }

  let modifiedComponents = 0;

  // Find all React components
  const components = [];
  
  // 1. Function declarations (function MyComp() {})
  sourceFile.getFunctions().forEach(f => {
    if (f.getName() && /^[A-Z]/.test(f.getName())) {
      components.push({ name: f.getName(), body: f.getBody(), node: f });
    }
  });

  // 2. Arrow functions (const MyComp = () => {})
  sourceFile.getVariableDeclarations().forEach(vd => {
    if (vd.getName() && /^[A-Z]/.test(vd.getName())) {
      const init = vd.getInitializer();
      if (init && (init.getKind() === SyntaxKind.ArrowFunction || init.getKind() === SyntaxKind.FunctionExpression)) {
        components.push({ name: vd.getName(), body: init.getBody(), node: init });
      }
    }
  });

  for (const comp of components) {
    let body = comp.body;
    
    // Convert implicit return arrow function to block body
    if (body && body.getKind() !== SyntaxKind.Block && comp.node.getKind() === SyntaxKind.ArrowFunction) {
      const oldText = body.getText();
      comp.node.setBodyText(`return ${oldText};`);
      body = comp.node.getBody(); // Re-fetch the new block body
    }

    if (body && body.getKind() === SyntaxKind.Block) {
      const bodyText = body.getText();
      if (!bodyText.includes('useForgeTheme()')) {
        const tDestructure = tIdentifier === 'T' ? 'const { T } = useForgeTheme();' : `const { T: ${tIdentifier} } = useForgeTheme();`;
        body.insertStatements(0, tDestructure);
        if (stylesheetName) {
          const hookName = 'use' + stylesheetName.charAt(0).toUpperCase() + stylesheetName.slice(1);
          body.insertStatements(1, `const ${stylesheetName} = ${hookName}(${tIdentifier});`);
        }
        modifiedComponents++;
      }
    }
  }

  // Only swap imports if we actually modified components, otherwise leave it (e.g. if it's just a constants file)
  if (modifiedComponents > 0) {
    let useForgeImport = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue().includes('useForgeTheme'));
    if (!useForgeImport) {
      sourceFile.addImportDeclaration({
        namedImports: ['useForgeTheme'],
        moduleSpecifier: '@/hooks/useForgeTheme'
      });
    }
    if (forgeThemeImportDecl) {
      forgeThemeImportDecl.remove();
    }
  }
}

project.saveSync();
console.log('Done!');
