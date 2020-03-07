#! /bin/bash
fuser -k 3007/tcp
cd /home/ecolote
rm -rf node_modules
rm -f package-lock.json
pwd
npm i
npm rebuild
tsc
mkdir -p /home/ecolote/dist/src/media
cp /home/ecolote/src/media /home/ecolote/dist/src/media
mkdir -p /home/ecolote/dist/src/articles
cp /home/ecolote/src/articles /home/ecolote/dist/src/articles
mkdir -p /home/ecolote/dist/src/public
cp /home/ecolote/src/public /home/ecolote/dist/src/public
npm start

