const url = `https://api.cloudinary.com/v1_1/dwilc78qs/auto/upload`

const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'chat-app-file')

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    })

    const responseJsonData = await response.json()
    return responseJsonData;
}

export default uploadFile;

