const fileService = require('../services/fileService');
const fs = require('fs');
const User = require('../models/User');
const File = require('../models/File');
require('dotenv').config();

const stream = require('stream');
//const { Transform } = require('stream');

const path = require('path');
const { google } = require('googleapis');
//const { error } = require('console');
const KEY_FILE_PATH = path.join(__dirname, '../api-google.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
   keyFile: KEY_FILE_PATH,
   scopes: SCOPES
});
const driveService = google.drive({ version: 'v3', auth });

class FileController {
   async createDir(req, res) {
      try {
         const { name, type, parent } = req.body;
         const file = new File({ name, type, parent, user: req.user.id });
         const parentFile = await File.findOne({ _id: parent });
         if (!parentFile) {
            file.path = name;
            await fileService.createDir(req, file);
         } else {
            file.path = `${parentFile.path}/${file.name}`;
            await fileService.createDir(req, file);
            parentFile.childs.push(file._id);
            await parentFile.save();
         }

         await file.save();
         return res.json(file);
      } catch (e) {
         console.log(e);
         return res.status(400).json(e);
      }
   }

   async getFiles(req, res) {
      try {
         const { sort } = req.query;
         let files;
         switch (sort) {
            case 'name':
               files = await File.find({
                  user: req.user.id,
                  parent: req.query.parent
               }).sort({ name: 1 });
               break;
            case 'type':
               files = await File.find({
                  user: req.user.id,
                  parent: req.query.parent
               }).sort({ type: 1 });
               break;
            case 'date':
               files = await File.find({
                  user: req.user.id,
                  parent: req.query.parent
               }).sort({ date: 1 });
               break;
            case 'size':
               files = await File.find({
                  user: req.user.id,
                  parent: req.query.parent
               }).sort({ size: 1 });
               break;
            default:
               files = await File.find({
                  user: req.user.id,
                  parent: req.query.parent
               });
               break;
         }
         return res.json(files);
      } catch (e) {
         console.log(e);
         return res.status(500).json({ message: 'Can not get files' });
      }
   }

   async uploadFile(req, res) {
      try {
         const file = req.files.file;
         const parent = await File.findOne({
            user: req.user.id,
            _id: req.body.parent
         });
         const user = await User.findOne({ _id: req.user.id });
         user.usedSpace + file.size > user.diskSpace &&
            res.status(400).json({ message: 'There no space on the disk' });
         user.usedSpace = user.usedSpace + file.size;
         let path;
         parent
            ? (path = `${req.filePath}/${user._id}/${parent.path}/${file.name}`)
            : (path = `${req.filePath}/${user._id}/${file.name}`);
         fs.existsSync(path) &&
            res.status(400).json({ message: 'File already exists' });
         file.mv(path);
         const type = file.name.split('.').pop();
         let filePath = file.name;
         parent && (filePath = parent.path + '/' + file.name);

         const dbFile = new File({
            name: file.name,
            type,
            size: file.size,
            path: filePath,
            parent: parent ? parent._id : null,
            user: user._id
         });

         await dbFile.save();
         await user.save();

         res.json(dbFile);
      } catch (e) {
         console.log(e);
         return res.status(500).json({ message: 'Upload error' });
      }
   }

   async downloadFile(req, res) {
      try {
         const file = await File.findOne({
            _id: req.query.id,
            user: req.user.id
         });
         const path = fileService.getPath(req, file);
         return fs.existsSync(path)
            ? res.download(path, file.name)
            : res.status(400).json({ message: 'Download error' });
      } catch (e) {
         console.log(e);
         res.status(500).json({ message: 'Download error' });
      }
   }

   async deleteFile(req, res) {
      try {
         const file = await File.findOne({
            _id: req.query.id,
            user: req.user.id
         });
         !file && res.status(400).json({ message: 'file not found' });
         fileService.deleteFile(req, file);
         await file.remove();
         return res.json({ message: 'File was deleted' });
      } catch (e) {
         console.log(e);
         return res.status(400).json({ message: 'Dir is not empty' });
      }
   }
   async searchFile(req, res) {
      try {
         const searchName = req.query.search;
         let files = await File.find({ user: req.user.id });
         files = files.filter((file) => file.name.includes(searchName));
         return res.json(files);
      } catch (e) {
         console.log(e);
         return res.status(400).json({ message: 'Search error' });
      }
   }
   async fileList(req, res) {
      try {
         const resp = await driveService.files.list({
            q: "'1n9tDhHRyYSUmeP2LRd9aZHBxo0If29Da' in parents",
            pageSize: 20,
            fields:
               'nextPageToken, files(id, name, mimeType, createdTime, parents)'
         });
         const files = resp.data.files;
         const fileArray = [];
         if (files.length) {
            const fileDisplay = [];
            const fileId = [];
            const mimeType = [];
            const parents = [];
            for (let i = 0; i < files.length; i++) {
               fileDisplay.push(files[i].name);
               fileId.push(files[i].id);
               mimeType.push(files[i].mimeType);
               parents.push(files[i].parents);
            }
            for (let y = 0; y < fileDisplay.length; y++) {
               fileArray.push({
                  file: fileDisplay[y],
                  id: fileId[y],
                  type: mimeType[y],
                  parents: parents[y]
               });
            }
         }
         res.json(fileArray);
      } catch (error) {}
   }

   async getPdf(req, res) {
      try {
         const fileList = [];
         let NextPageToken = '';
         do {
            const params = {
               q: `'${req.query.id}' in parents`,
               orderBy: 'name',
               pageToken: NextPageToken || '',
               pageSize: 1000,
               fields: 'nextPageToken, files(id, name,parents)'
            };
            const testing = await driveService.files.list(params);
            Array.prototype.push.apply(fileList, testing.data.files);
            NextPageToken = testing.data.nextPageToken;
         } while (NextPageToken);
         const regexStr = (string) => {
            const reg = /[^\d]/g;
            return parseInt(string.replace(reg, ''));
         };

         fileList.sort((a, b) => regexStr(a.name) - regexStr(b.name));

         driveService.files.get(
            {
               fileId: fileList[req.query.page - 1].id,
               alt: 'media',
               supportsAllDrives: true
            },
            { responseType: 'stream' },
            (error, { data }) => {
               if (error) {
                  return reject('The API returned an error: ' + error);
               }
               let buf = [];
               data.on('data', (chunk) => {
                  // put number page
                  buf.push(chunk);
               });

               data.on('end', function () {
                  const buffer = Buffer.concat(buf);
                  // fs.writeFile("filename.pdf", buffer, err => console.log(err)); // For testing

                  res.json(buffer);
               });
            }
         );
      } catch (e) {
         console.log(e);
         res.status(500).json({ message: 'Download error' });
      }
   }

   async uploadAvatar(req, res) {
      try {
         const file = req.files.file;
         const bufferStream = new stream.PassThrough();
         bufferStream.end(file.data);
         const { data } = await driveService.files.create({
            media: {
               mimeType: file.mimetype,
               body: bufferStream
            },
            requestBody: {
               name: file.name,
               parents: ['1qjha1gkaeF-OIzW-1nZwKqsCpTDXii_T']
            },
            fields: 'id,name'
         });
         const user = await User.findById(req.user.id);
         const avatarName = data.id;
         user.avatar = avatarName;
         await user.save();
         return res.json(user);
      } catch (e) {
         console.log(e);
         return res.status(400).json({ message: 'Upload avatar error' });
      }
   }
   async deleteAvatar(req, res) {
      try {
         const user = await User.findById(req.user.id);
         driveService.files.delete({
            fileId: user.avatar
         });
         user.avatar = null;
         await user.save();
         return res.json(user);
      } catch (e) {
         console.log(e);
         return res.status(400).json({ message: 'Delete avatar error' });
      }
   }
}

module.exports = new FileController();
