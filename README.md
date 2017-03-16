## Template Mail Sender

### About
Template mail sender is a web application which based on javascript/nodejs. It's ready for GoogleCloud platform. Save attachments on google cloud storage. Use database as Google cloud datastore and also use redis for session & queue management.

### How it works
Rendering user templates by given parameters, then send rendered template to given mail address. When sending process complate also it can be save 1 copy to imap directory.
  
### Features
* Google cloud platform ready (by using [GoogleCloudPlatform/google-cloud-node](https://github.com/GoogleCloudPlatform/google-cloud-node))
  * Google Cloud Datastore
  * Google Cloud Storage
  * Google Cloud Container
  * Google Cloud Logging
* Can run as multiple instance without any config (by using same redis backend)
* Message queue processing (by using [OptimalBits/bull](https://github.com/OptimalBits/bull))
* Template rendering (by using [wycats/handlebars.js](https://github.com/wycats/handlebars.js))
* Useful handlebars plugins for attach files on Storage or embed them. (see wiki for [helpers](https://github.com/PlatinMarket/platinmarket-template-mailer/wiki))
  * `attach` *attach file on google cloud storage*
  * `link` *returns global url for given file on google cloud storage*
  * `date` *returns date string by given format (by using [moment/moment](https://github.com/moment/moment))*
  * `embed` *embed storage file into template*
  * `render` *render storage file then embed it into template*
  * `user_variable` *returns custom user parameter*

### Install
Install node packages;
```
npm install
```
Run instance by set env values 
```
PROJECT_ID=GOOGLE_PROJECT_ID BUCKET=GOOGLE_STORAGE_BUCKET REDIS_PORT=REDIS_PORT npm start
```

#### Environment Variables
* `PROJECT_ID` **required** Google Cloud Project ID
* `BUCKET` **required** Google Cloud Storage Bucket
* `REDIS_PORT` optional Redis port default `6379`
* `REDIS_HOST` optional Redis host default `localhost`
* `GOOGLE_APPLICATION_CREDENTIALS` optional Google Cloud app auth json file location
* `LOG_LEVEL` optional Log level default `info` (uses Google Cloud Logging in production mode)
* `NODE_ENV` optional Production flag default null (use `production` for production)
* `PORT` optional Server port default `3000`

### Using
navigate to [http://localhost:3000](http://localhost:3000) 


