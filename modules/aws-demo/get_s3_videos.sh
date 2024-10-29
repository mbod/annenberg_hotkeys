#!/bin/bash

# Etienne Jacquot (Annenberg IT Department)
# 10/29/2024

#######################
# Sample Usage:
# ./get_s3_videos.sh us-east-1 AWS-Named-Profile assets.s3bucket.com data/videos


echo -e "-------------------------------------------------"
echo -e "Annenberg Hotkeys - Get S3 Videos Demo"
echo -e "-------------------------------------------------"
echo -e ""
sleep 1

# Check if region and profile are provided as arguments
if [ -z "$1" ]; then
  echo "Enter the region:"
  read region
else
  region=$1
  echo -e " 👉 Region: $region"
  sleep 1
fi

if [ -z "$2" ]; then
  echo "Enter the named profile:"
  read profile
else
  profile=$2
  echo -e " 👉 Profile: $profile"
  sleep 1
fi

if [ -z "$3" ]; then
  echo "Enter the bucket:"
  read bucket
else
  bucket=$3
  echo -e " 👉 Bucket: $bucket"
  sleep 1
fi
if [ -z "$4" ]; then
  echo "Enter the bucket key:"
  read bucket_key
else
  bucket_key=$4
  echo -e " 👉 Bucket key: (i.e. data folder): $bucket_key"
  sleep 1
fi

echo -e "-------------------------------------------------"
sleep 1

# Check that the named profile is valid with an sts call and print a message
echo -e "\nChecking that the named profile is valid...\n"
if aws sts get-caller-identity --profile $profile > /dev/null
then
    echo " ✅ The named profile ($profile) is valid for region ($region)!"
else
    echo " ❌ The named profile ($profile) is not valid for region ($region). Please try again."
    exit 1
fi
sleep 1

# Check that the bucket exists and print a message
echo -e "\nChecking that the bucket exists...\n"
if aws s3api head-bucket --bucket $bucket --region $region --profile $profile
then
    echo " ✅ The bucket ($bucket) exists!"
else
    echo " ❌ The bucket ($bucket) does not exist. Please try again."
    exit 1
fi

sleep 1
# check that bucket key exists
echo -e "\nChecking that the bucket key exists...\n"
if [[ $(aws s3 ls s3://$bucket/$bucket_key/ --region $region --profile $profile | head) ]];
then
    echo " ✅ The bucket key ($bucket_key) exists!"
else
    echo " ❌ The bucket key ($bucket_key) does not exist. Please try again."
    exit 1
fi
echo -e ""
echo -e "-------------------------------------------------"
echo -e ""
sleep 1

echo -e "Fetching a list of video files in the bucket and bucket key..."
sleep 1
# Fetch a list of video files in the bucket and bucket key
aws s3 ls s3://$bucket/$bucket_key/ --region $region --profile $profile > /dev/null

# okay so I want to take all those video files, and pipe to a URL that is public
# format should be https://$BUCKET/$BUCKET_KEY/$VIDEO_FILE
# I want to take the output of the above command and pipe it to a file

aws s3 ls s3://$bucket/$bucket_key/ --region $region --profile $profile | awk -v bucket="$bucket" -v bucket_key="$bucket_key" '{print "https://" bucket "/" bucket_key "/" $4}' > video_files.txt

echo -e ""
echo -e "-------------------------------------------------"
echo -e ""
echo -e "AWS S3 VIDEO ASSET URLS ARE THE FOLLOWING:"
echo -e ""
sleep 1
grep '\.mp4$' video_files.txt
echo -e ""
echo -e "-------------------------------------------------"
echo -e ""
echo -e "The video URLs have been saved to video_files.txt"