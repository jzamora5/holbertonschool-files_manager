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
}

export default FilesController;
