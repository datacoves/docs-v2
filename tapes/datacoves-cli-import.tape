Output "../docs/reference/vscode/assets/datacoves-cli-import.gif"
Source "_settings.tape"
Set Height 560
Source "_enter-code-server.tape"

Type "datacoves my import"
Enter
Wait@120s /\$\s*$/
Sleep 4s
Type "datacoves my import --connections --force"
Enter
Wait@120s /\$\s*$/
Sleep 5s
