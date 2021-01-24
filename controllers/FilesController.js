import { ObjectId } from 'mongodb';
import userUtils from '../utils/user';
import fileUtils from '../utils/file';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(request, response) {
    const { userId } = await userUtils.getUserIdAndKey(request);

    const user = await userUtils.getUser({
      _id: ObjectId(userId),
    });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const { error: validationError, fileParams } = await fileUtils.validateBody(
      request,
    );

    if (validationError) return response.status(400).send({ error: validationError });

    const newFile = await fileUtils.saveFile(userId, fileParams, FOLDER_PATH);

    return response.status(201).send(newFile);
  }

  static async getShow(request, response) {
    const fileId = request.params.id;

    const { userId } = await userUtils.getUserIdAndKey(request);

    const user = await userUtils.getUser({
      _id: ObjectId(userId),
    });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    // Mongo Condition for Id
    // if (fileId.length !== 12)
    //   return response.status(404).send({ error: 'Not found' });

    const result = await fileUtils.getFile({
      _id: ObjectId(fileId),
      userId,
    });

    if (!result) return response.status(404).send({ error: 'Not found' });

    const file = { id: result._id, ...result };

    delete file.localPath;
    delete file._id;

    return response.status(200).send(file);
  }

  static async getIndex(request, response) {
    const { userId } = await userUtils.getUserIdAndKey(request);

    const user = await userUtils.getUser({
      _id: ObjectId(userId),
    });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    let parentId = request.query.parentId || 0;

    if (parentId === '0') parentId = 0;

    let page = Number(request.query.page) || 0;

    if (Number.isNaN(page)) page = 0;

    if (parentId !== 0) {
      const folder = await fileUtils.getFile({
        _id: ObjectId(parentId),
      });

      if (!folder || folder.type !== 'folder') return response.status(200).send([]);
    }

    const pipeline = [
      { $match: { parentId } },
      { $skip: page * 20 },
      {
        $limit: 20,
      },
    ];

    const fileCursor = await fileUtils.getFilesOfParentId(pipeline);

    const fileList = [];
    await fileCursor.forEach((doc) => {
      const document = doc;
      delete document.localPath;
      fileList.push(document);
    });

    return response.status(200).send(fileList);
  }

  static async putPublish(request, response) {
    const { error, code, updatedFile } = await fileUtils.publishUnpublish(
      request,
      true,
    );

    if (error) return response.status(code).send({ error });

    return response.status(code).send(updatedFile);
  }

  static async putUnpublish(request, response) {
    const { error, code, updatedFile } = await fileUtils.publishUnpublish(
      request,
      false,
    );

    if (error) return response.status(code).send({ error });

    return response.status(code).send(updatedFile);
  }
}

export default FilesController;
