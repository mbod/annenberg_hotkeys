#!/bin/bash

# Create the folder structure
mkdir -p 1/a

# Read each line from video_files.txt and create symbolic links
while IFS= read -r url; do
  # Extract the filename from the URL
  filename=$(basename "$url")
  
  # Create a symbolic link in the 1/a directory
  ln -s "$url" "1/a/$filename"
done < video_files.txt

echo "Symbolic links created in 1/a for each video file listed in video_files.txt"