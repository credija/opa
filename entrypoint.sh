#!/bin/sh
if [ -d /app/bundle ]
then 
  yarn build && yarn cache clean && yarn start
else
  yarn start
fi