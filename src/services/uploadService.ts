import api from '../config/api';

class UploadService {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async deleteImage(publicId: string) {
    const response = await api.delete(`/upload/image/${publicId}`);
    return response.data;
  }
}

export const uploadService = new UploadService();