import React, { useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

const CodeEditor = ({ className, code, onEditorChange }) => {
  return (
    <CodeMirror
      className={className}
      value={code || ""}
      onChange={onEditorChange}
      theme={vscodeDark}
      basicSetup={{
        autoCompletion: false,
        foldGutter: true,
      }}
      s
      extensions={[langs.html()]}
    />
  );
};

export default CodeEditor;
