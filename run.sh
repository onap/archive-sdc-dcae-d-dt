#!/bin/bash
echo "build"
npm run build

echo "Move to dist..."
cd dist/imploded

echo "Create war file..."
jar -cvf dcae.war *
