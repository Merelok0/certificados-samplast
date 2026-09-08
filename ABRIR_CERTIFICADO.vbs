Option Explicit

Dim shell, fso, baseDir, pythonCheck, cmd, indexPath
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

baseDir = fso.GetParentFolderName(WScript.ScriptFullName)
indexPath = fso.BuildPath(baseDir, "index.html")

' Verificar si Python está disponible
pythonCheck = shell.Run("cmd /c python --version >nul 2>&1", 0, True)

If pythonCheck = 0 Then
    ' Iniciar servidor local oculto
    cmd = "cmd /c cd /d """ & baseDir & """ && python -m http.server 8765"
    shell.Run cmd, 0, False

    ' Dar tiempo al servidor para iniciar
    WScript.Sleep 1200

    ' Abrir la aplicación en el navegador predeterminado
    shell.Run "http://127.0.0.1:8765/", 1, False
Else
    ' Si no hay Python, abrir el HTML directamente
    shell.Run """" & indexPath & """", 1, False
End If
