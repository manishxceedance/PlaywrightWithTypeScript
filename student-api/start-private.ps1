$ErrorActionPreference = 'Stop'

function Read-PrivateValue([string] $Prompt) {
    $secureValue = Read-Host $Prompt -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        $secureValue.Dispose()
    }
}

try {
    $env:STUDENT_API_USER = Read-PrivateValue 'Administrator user ID (hidden)'
    $env:STUDENT_API_PASSWORD = Read-PrivateValue 'Administrator password (hidden)'
    & node (Join-Path $PSScriptRoot 'server.js')
}
finally {
    Remove-Item Env:STUDENT_API_USER -ErrorAction SilentlyContinue
    Remove-Item Env:STUDENT_API_PASSWORD -ErrorAction SilentlyContinue
}