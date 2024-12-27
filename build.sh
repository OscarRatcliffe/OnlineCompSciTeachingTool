cd backend
tsc
cd ..
find . -name "._*" -delete
docker compose -f dockercompose.yaml up --build