"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from "lucide-react"

interface ImageUploadProps {
  images: Array<{
    id?: string
    url: string
    file?: File
    altText?: string
    order?: number
  }>
  onImagesChange: (images: Array<{
    id?: string
    url: string
    file?: File
    altText?: string
    order?: number
  }>) => void
  maxImages?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className = ""
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPEG, PNG, or WebP.`
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB.`
    }

    return null
  }

  const createImagePreview = (file: File): Promise<{ url: string; file: File }> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve({
          url: e.target?.result as string,
          file
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFiles = useCallback(async (files: FileList) => {
    const newErrors: string[] = []
    const validFiles: File[] = []
    const imagePreviews: Array<{ url: string; file: File }> = []

    // Check total images limit
    if (images.length + files.length > maxImages) {
      newErrors.push(`Maximum ${maxImages} images allowed. You have ${images.length} and tried to add ${files.length}.`)
      setErrors(newErrors)
      return
    }

    // Validate each file
    for (const file of Array.from(files)) {
      const error = validateFile(file)
      if (error) {
        newErrors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    // Create previews for valid files
    setUploading(true)
    try {
      for (const file of validFiles) {
        const preview = await createImagePreview(file)
        imagePreviews.push(preview)
      }

      // Add new images to existing ones
      const updatedImages = [
        ...images.map((img, index) => ({ ...img, order: index })),
        ...imagePreviews.map((img, index) => ({
          ...img,
          order: images.length + index
        }))
      ]

      onImagesChange(updatedImages)
      setErrors([])
    } catch (error) {
      setErrors(["Failed to process images. Please try again."])
    } finally {
      setUploading(false)
    }
  }, [images, maxImages, maxSize, acceptedTypes, onImagesChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i }))
    onImagesChange(updatedImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images]
    const [movedImage] = updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, movedImage)
    
    // Update order values
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order: index
    }))
    
    onImagesChange(reorderedImages)
  }

  const updateImageAltText = (index: number, altText: string) => {
    const updatedImages = [...images]
    updatedImages[index] = { ...updatedImages[index], altText }
    onImagesChange(updatedImages)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <Upload className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploading ? "Processing images..." : "Drop images here or click to upload"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Maximum {maxImages} images, up to {maxSize}MB each
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, or WebP formats
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Upload Errors</h4>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Images ({images.length}/{maxImages})
            </h3>
            <p className="text-sm text-gray-500">
              Drag to reorder, click X to remove
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                className="relative group border rounded-lg overflow-hidden bg-gray-50"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", index.toString())
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const fromIndex = parseInt(e.dataTransfer.getData("text/plain"))
                  if (fromIndex !== index) {
                    moveImage(fromIndex, index)
                  }
                }}
              >
                {/* Image */}
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.altText || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-colors">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded px-2 py-1 text-xs">
                        Drag to reorder
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alt Text Input */}
                <div className="p-2">
                  <input
                    type="text"
                    value={image.altText || ""}
                    onChange={(e) => updateImageAltText(index, e.target.value)}
                    placeholder="Add description..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Order Badge */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Upload More Button */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Add More Images
            </button>
          )}
        </div>
      )}

      {/* Success Message */}
      {images.length > 0 && errors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-900">
              {images.length} image{images.length !== 1 ? "s" : ""} ready for upload
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
