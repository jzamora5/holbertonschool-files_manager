import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import dbClient from './db';

const fileUtils = {
  async validateBody(request) {
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = request.body;
    const typesAllowed = ['file', 'image', 'folder'];
    let msg = null;

    if (!name) {
      msg = 'Missing name';
    } else if (!type || !typesAllowed.includes(type)) {
      msg = 'Missing type';
    } else if (!data && type !== 'folder') {
      msg = 'Missing data';
    } else if (parentId) {
      const file = await this.getFile({
        _id: ObjectId(parentId),
      });

      if (!file) {
        msg = 'Parent not found';
      } else if (file.type !== 'folder') {
        msg = 'Parent is not a folder';
      }
    }

    const obj = {
      error: msg,
      fileParams: {
        name,
        type,
        parentId,
        isPublic,
        data,
      },
    };

    return obj;
  },

  async getFile(query) {
    const file = await dbClient.filesCollection.findOne(query);
    return file;
  },

  async getFilesOfParentId(query) {
    const fileList = await dbClient.filesCollection.aggregate(query);
    return fileList;
  },

  async saveFile(userId, fileParams, FOLDER_PATH) {
    const {
      name, type, isPublic, parentId, data,
    } = fileParams;

    const query = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    if (fileParams.type !== 'folder') {
      const fileNameUUID = uuidv4();

      const fileDataDecoded = Buffer.from(data, 'base64').toString('utf-8');

      const path = `${FOLDER_PATH}/${fileNameUUID}`;

      query.localPath = path;

      await fsPromises.mkdir(FOLDER_PATH, { recursive: true });
      await fsPromises.writeFile(path, fileDataDecoded);
    }

    const result = await dbClient.filesCollection.insertOne(query);

    delete query._id;
    delete query.localPath;

    const newFile = { id: result.insertedId, ...query };

    return newFile;
  },
};

export default fileUtils;
