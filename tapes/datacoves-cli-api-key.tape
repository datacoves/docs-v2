Output "../docs/reference/vscode/assets/datacoves-cli-api-key.gif"
Source "_settings.tape"
Set Height 720
Source "_enter-code-server.tape"

Type `datacoves my api-key generate --name "My Script"`
Enter
Wait@120s /\$\s*$/
Sleep 6s
Type "clear"
Enter
Type "datacoves my api-key list"
Enter
Wait@120s /\$\s*$/
Sleep 4s
