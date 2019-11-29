/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var storage = window.localStorage;
var defaultLink = 'http://situ.tf.itb.ac.id';

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {

        if(storage.getItem('link') == undefined) {
            storage.setItem('link', defaultLink);
        }
        
        document.getElementById("btnOpen").addEventListener("click", function() {
            openCamera('camera',false);
        });

        document.getElementById("btnGallery").addEventListener("click", function() {
            openCamera('gallery',true);
        });

        document.getElementById("btnSave").addEventListener("click", function() {
            var value = document.getElementById("txtLink").value;
            storage.setItem('link', value);

            document.querySelector(".app").classList.remove('hide');
            document.querySelector(".config").classList.add('hide');
            
            alert('berhasil disimpan');
        });

        document.getElementById("btnConfig").addEventListener("click", function() {
            document.querySelector(".app").classList.add('hide');
            document.querySelector(".config").classList.remove('hide');
        }); 

        //init link
        document.getElementById("txtLink").value = storage.getItem('link');
    },

};

app.initialize();

function openCamera(mode,edit) {
    
    var options = {

        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL, //base64
        // destinationType: Camera.DestinationType.FILE_URI, // image path
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: mode == 'camera' ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: edit,
        correctOrientation: true  //Corrects Android orientation quirks
    }
        
    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        // displayImage(imageUri);
        SpinnerDialog.show();
        uploadImage(imageUri);

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}

function openWeb(id) {
    var link = storage.getItem('link')+'/bangunan/'+id;
    cordova.InAppBrowser.open(link, '_blank', 'location=yes');
}

async function uploadImage(base64) {
    var link = storage.getItem('link')+'/recog.php';
    var formData = new FormData();
    
    formData.append('img', base64);
    
    try {
      const response = await fetch(link, {
        method: 'POST',
        body: formData
      });
      var result = await response.json();

      SpinnerDialog.hide();
      alert('Tingkat Kecocokan = '+result.id+' : '+result.score);

      if(result.score > 0.5) {
        openWeb(result.id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
}