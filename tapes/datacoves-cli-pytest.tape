Output "../docs/reference/vscode/assets/datacoves-cli-pytest.gif"
Source "_settings.tape"
Set Height 760
Source "_enter-code-server.tape"

Type "datacoves my pytest -- orchestrate/test_dags/validate_dags.py"
Enter
Wait@300s /\$\s*$/
Sleep 6s
