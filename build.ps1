cd backend
tsc
cd ..
$hostIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "Ethernet*" -or $_.InterfaceAlias -like "Wi-Fi*"} | Select-Object -Last 1).IPAddress #Get host IP
docker compose -f .\dockercompose.yaml up --build