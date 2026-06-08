// Baca File menjadi data URL base64 (untuk mock; backend nanti object storage)
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function filesToDataUrls(fileList) {
  const files = Array.from(fileList || [])
  return Promise.all(files.map(fileToDataUrl))
}
