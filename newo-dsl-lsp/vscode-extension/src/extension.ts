/**
 * Newo DSL VS Code Extension
 *
 * Provides language support for Newo DSL templates:
 * - Syntax highlighting
 * - Diagnostics
 * - Completions
 * - Hover information
 * - Go to definition
 */

import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Newo DSL extension activating...');

  // Server is bundled at dist/server.js (same directory as extension.js)
  const serverModule = path.join(context.extensionPath, 'dist', 'server.js');
  const serverExists = fs.existsSync(serverModule);

  console.log('Newo DSL Extension path:', context.extensionPath);
  console.log('Newo DSL Server module:', serverExists ? serverModule : 'NOT FOUND');

  // Register commands (always available)
  context.subscriptions.push(
    vscode.commands.registerCommand('newo-dsl.validateDocument', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        if (client) {
          vscode.window.showInformationMessage('Validating Newo DSL document...');
          client.sendRequest('textDocument/diagnostic', {
            textDocument: { uri: editor.document.uri.toString() }
          });
        } else {
          vscode.window.showWarningMessage('Language server not running. Only syntax highlighting is available.');
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('newo-dsl.reloadSchemas', () => {
      if (client) {
        vscode.window.showInformationMessage('Reloading Newo DSL schemas...');
        client.sendNotification('newo-dsl/reloadSchemas');
      } else {
        vscode.window.showWarningMessage('Language server not running.');
      }
    })
  );

  // Only start the language client if server exists
  if (serverExists) {
    // Server options
    const serverOptions: ServerOptions = {
      run: {
        module: serverModule,
        transport: TransportKind.ipc
      },
      debug: {
        module: serverModule,
        transport: TransportKind.ipc,
        options: {
          execArgv: ['--nolazy', '--inspect=6009']
        }
      }
    };

    // Client options
    const clientOptions: LanguageClientOptions = {
      documentSelector: [
        { scheme: 'file', language: 'newo-jinja' },
        { scheme: 'file', language: 'newo-guidance' },
        { scheme: 'file', language: 'newo-nsl' },
        { scheme: 'file', language: 'newo-nslg' }
      ],
      synchronize: {
        fileEvents: vscode.workspace.createFileSystemWatcher('**/*.schema.yaml')
      },
      outputChannelName: 'Newo DSL'
    };

    // Create and start client
    client = new LanguageClient(
      'newo-dsl',
      'Newo DSL Language Server',
      serverOptions,
      clientOptions
    );

    // Start client
    client.start().then(() => {
      console.log('Newo DSL Language Server started');
      vscode.window.showInformationMessage('Newo DSL extension activated with LSP support');
    }).catch(err => {
      console.error('Failed to start Newo DSL Language Server:', err);
      vscode.window.showWarningMessage(
        'Newo DSL: Syntax highlighting active. LSP server failed to start.'
      );
    });
  } else {
    // Server not found - extension still works for syntax highlighting
    console.log('Newo DSL: Running in syntax-highlighting-only mode');
    vscode.window.showInformationMessage(
      'Newo DSL extension activated (syntax highlighting only)'
    );
  }

  // Register status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(symbol-misc) Newo DSL';
  statusBarItem.tooltip = 'Newo DSL Language Support';
  statusBarItem.command = 'newo-dsl.validateDocument';
  context.subscriptions.push(statusBarItem);

  // Show status bar for relevant files
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        const lang = editor.document.languageId;
        if (lang === 'newo-jinja' || lang === 'newo-guidance' || lang === 'newo-nsl' || lang === 'newo-nslg') {
          statusBarItem.show();
        } else {
          statusBarItem.hide();
        }
      }
    })
  );

  // Check initial editor
  if (vscode.window.activeTextEditor) {
    const lang = vscode.window.activeTextEditor.document.languageId;
    if (lang === 'newo-jinja' || lang === 'newo-guidance' || lang === 'newo-nsl' || lang === 'newo-nslg') {
      statusBarItem.show();
    }
  }

  console.log('Newo DSL extension activated');
}

/**
 * Extension deactivation
 */
export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
