class FilesController {
  static postUpload(request, response) {
    const { userId } = await getUserIdAndKey(request);

    const user = await getUser({
      _id: ObjectId(userId),
    });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    
  }
}

export default FilesController;
