#!/bin/sh
if [ -d /app/bundle ];
then
  echo "yarn start"
  yarn start
else
  echo "yarn build && start"
  yarn build && yarn cache clean && yarn start
fi
