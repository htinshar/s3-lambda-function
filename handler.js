'use strict';
const aws = require('aws-sdk');
var gm = require('gm').subClass({imageMagick:true});

var s3 = new aws.S3();

module.exports.s3_thumbnail_generator = (event, context, callback) => {
  
  var bucket = event['Records'][0]['s3']['bucket']['name'];
  
  var key = event['Records'][0]['s3']['object']['key'];

  // get the image
  var uploadedImage = getImage(bucket, key);

  // resize the image and upload to s3
  resizeAndUploadImage(bucket, uploadedImage);

  callback(null, 'Image and Resize and uploaded to s3');
};


var getImage = function(bucket, key){

  var data = s3.getObject({Bucket:bucket, Key:key}).promise();

  return data;
}

var resizeAndUploadImage = function(bucket, uploadedImage){

  uploadedImage.then(function(data){
    //resize image 
    gm(data.Body)
      .resize(process.env.THUMBNAIL_SIZE, process.env.THUMBNAIL_SIZE)
      .toBuffer('png', function(err, buffer){
        uploadToS3(buffer, bucket);
      });
  });
}

var uploadToS3 = function(image, bucket){
  s3.putObject({Bucket:bucket, Key:'newTumbnailImage.png', Body:image}, function(error, data){
    console.log('successfully resize and updated');
  });
}
