// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
const axios = require("axios").default;
const util = require("util");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const HTTPMethods = ["GET", "POST", "PUT", "DELETE"];

  let disposable = vscode.commands.registerTextEditorCommand(
    "extension.restcall",
    function(editor) {
      // Get active line and it's content
      const activeLine = editor.selection.active.line;
      let lineContent = editor.document.lineAt(activeLine)["_text"];
      lineContent = lineContent.trim();
      fs.writeFileSync(`${__dirname}/Response.json`, "Loading...");

      // check content must be in valid format
      if (lineContent !== "") {
        let HTTPRequest = lineContent.slice(2);
        HTTPRequest = HTTPRequest.split("=>"); // Get all parameters

        if (HTTPRequest.length >= 2) {
          // Content atleast have HTTP method and URI `// {HTTP_METHOD} {URI}`
          const givenHTTPMethod = HTTPRequest[0].trim();
          const givenEndPoint = HTTPRequest[1].trim();
          let givenHeader = HTTPRequest[2].trim() || null;
          let givenBody = HTTPRequest[3].trim() || null;
          const givenOnlyKey = HTTPRequest[4].trim() || null;

          const index = HTTPMethods.indexOf(givenHTTPMethod);

          // API config object
          const configObj = {
            method: givenHTTPMethod,
            url: givenEndPoint
          };

          // set Header
          givenHeader = JSON.parse(givenHeader);
          configObj.headers = givenHeader || {};

          // set body
          givenBody = JSON.parse(givenBody);
          configObj.data = givenBody || {};

          if (index !== -1) {
            vscode.workspace
              .openTextDocument(`${__dirname}/Response.json`)
              .then(doc => {
                vscode.window.showTextDocument(doc, {
                  viewColumn: vscode.ViewColumn.Beside
                });
                return axios(configObj);
              })
              .then(resp => {
                let json = givenOnlyKey
                  ? util.inspect(resp[givenOnlyKey])
                  : util.inspect(resp);
                fs.writeFileSync(`${__dirname}/Response.json`, json);
              });
          } else {
            vscode.window.showErrorMessage(
              `Please select valid HTTP Method ['GET', 'POST', 'PUT', 'DELETE']`
            );
          }
        } else {
          vscode.window.showErrorMessage(
            "Content atleast have HTTP Method and URI `// {HTTP_METHOD} {URI}`"
          );
        }
      } else {
        vscode.window.showErrorMessage("Please select proper REST endpoint");
      }
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
