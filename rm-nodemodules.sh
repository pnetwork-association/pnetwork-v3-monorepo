#!/bin/bash

#
# Script to remove node_modules folder easily
# 

content=$(find packages -depth -maxdepth 3 -type d -name node_modules)
content=$(printf "%s\n%s\n" "$content" $(find . -depth -maxdepth 1 -type d -name node_modules))

echo "$content"
echo -n "Remove? [y/n] "
read

if [ "$REPLY" == "y" ] || [ "$REPLY" == "Y" ]; then
  echo "Removing..."
  echo "$content" | xargs rm -r
fi