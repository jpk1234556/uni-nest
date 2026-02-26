// Comprehensive validation schemas and utilities

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone validation regex (Uganda format)
const PHONE_REGEX = /^(\+256|0)?[7][0-9]{8}$/

// Password requirements
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  hasUppercase: true,
  hasLowercase: true,
  hasNumber: true,
  hasSpecialChar: true
}

// Common validation functions
export const validators = {
  // Email validation
  email: (email: string): ValidationError | null => {
    if (!email || email.trim() === '') {
      return { field: 'email', message: 'Email is required', code: 'REQUIRED' }
    }
    
    if (!EMAIL_REGEX.test(email)) {
      return { field: 'email', message: 'Please enter a valid email address', code: 'INVALID_FORMAT' }
    }
    
    if (email.length > 255) {
      return { field: 'email', message: 'Email address is too long', code: 'TOO_LONG' }
    }
    
    return null
  },

  // Phone validation
  phone: (phone: string): ValidationError | null => {
    if (!phone || phone.trim() === '') {
      return { field: 'phone', message: 'Phone number is required', code: 'REQUIRED' }
    }
    
    if (!PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
      return { field: 'phone', message: 'Please enter a valid Ugandan phone number', code: 'INVALID_FORMAT' }
    }
    
    return null
  },

  // Password validation
  password: (password: string): ValidationError | null => {
    if (!password || password.length === 0) {
      return { field: 'password', message: 'Password is required', code: 'REQUIRED' }
    }
    
    if (password.length < PASSWORD_MIN_LENGTH) {
      return { 
        field: 'password', 
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`, 
        code: 'TOO_SHORT' 
      }
    }
    
    if (PASSWORD_REQUIREMENTS.hasUppercase && !/[A-Z]/.test(password)) {
      return { field: 'password', message: 'Password must contain at least one uppercase letter', code: 'MISSING_UPPERCASE' }
    }
    
    if (PASSWORD_REQUIREMENTS.hasLowercase && !/[a-z]/.test(password)) {
      return { field: 'password', message: 'Password must contain at least one lowercase letter', code: 'MISSING_LOWERCASE' }
    }
    
    if (PASSWORD_REQUIREMENTS.hasNumber && !/\d/.test(password)) {
      return { field: 'password', message: 'Password must contain at least one number', code: 'MISSING_NUMBER' }
    }
    
    if (PASSWORD_REQUIREMENTS.hasSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { field: 'password', message: 'Password must contain at least one special character', code: 'MISSING_SPECIAL' }
    }
    
    return null
  },

  // Name validation
  name: (name: string, fieldName: string = 'name'): ValidationError | null => {
    if (!name || name.trim() === '') {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`, code: 'REQUIRED' }
    }
    
    if (name.length < 2) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 2 characters long`, code: 'TOO_SHORT' }
    }
    
    if (name.length > 50) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is too long`, code: 'TOO_LONG' }
    }
    
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} can only contain letters, spaces, hyphens, and apostrophes`, code: 'INVALID_CHARS' }
    }
    
    return null
  },

  // Text validation
  text: (text: string, fieldName: string, minLength: number = 1, maxLength: number = 1000): ValidationError | null => {
    if (!text || text.trim() === '') {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`, code: 'REQUIRED' }
    }
    
    if (text.length < minLength) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters long`, code: 'TOO_SHORT' }
    }
    
    if (text.length > maxLength) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than ${maxLength} characters`, code: 'TOO_LONG' }
    }
    
    return null
  },

  // Number validation
  number: (value: any, fieldName: string, min?: number, max?: number): ValidationError | null => {
    if (value === null || value === undefined || value === '') {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`, code: 'REQUIRED' }
    }
    
    const numValue = Number(value)
    
    if (isNaN(numValue)) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be a valid number`, code: 'INVALID_NUMBER' }
    }
    
    if (min !== undefined && numValue < min) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${min}`, code: 'TOO_SMALL' }
    }
    
    if (max !== undefined && numValue > max) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at most ${max}`, code: 'TOO_LARGE' }
    }
    
    return null
  },

  // Date validation
  date: (date: string | Date, fieldName: string, minDate?: Date, maxDate?: Date): ValidationError | null => {
    if (!date) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`, code: 'REQUIRED' }
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be a valid date`, code: 'INVALID_DATE' }
    }
    
    if (minDate && dateObj < minDate) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be after ${minDate.toLocaleDateString()}`, code: 'TOO_EARLY' }
    }
    
    if (maxDate && dateObj > maxDate) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be before ${maxDate.toLocaleDateString()}`, code: 'TOO_LATE' }
    }
    
    return null
  },

  // URL validation
  url: (url: string, fieldName: string = 'url'): ValidationError | null => {
    if (!url || url.trim() === '') {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`, code: 'REQUIRED' }
    }
    
    try {
      new URL(url)
    } catch {
      return { field: fieldName, message: 'Please enter a valid URL', code: 'INVALID_URL' }
    }
    
    return null
  },

  // File validation
  file: (file: File, allowedTypes: string[], maxSize: number, fieldName: string = 'file'): ValidationError | null => {
    if (!file) {
      return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`, code: 'REQUIRED' }
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { field: fieldName, message: `File type not allowed. Accepted types: ${allowedTypes.join(', ')}`, code: 'INVALID_TYPE' }
    }
    
    if (file.size > maxSize) {
      return { field: fieldName, message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`, code: 'TOO_LARGE' }
    }
    
    return null
  }
}

// Validation schemas for different entities
export const validationSchemas = {
  // User registration validation
  userRegistration: (data: {
    email: string
    firstName: string
    lastName: string
    password: string
    phone?: string
    role: string
  }): ValidationResult => {
    const errors: ValidationError[] = []
    
    // Email validation
    const emailError = validators.email(data.email)
    if (emailError) errors.push(emailError)
    
    // Name validations
    const firstNameError = validators.name(data.firstName, 'firstName')
    if (firstNameError) errors.push(firstNameError)
    
    const lastNameError = validators.name(data.lastName, 'lastName')
    if (lastNameError) errors.push(lastNameError)
    
    // Password validation
    const passwordError = validators.password(data.password)
    if (passwordError) errors.push(passwordError)
    
    // Phone validation (optional)
    if (data.phone) {
      const phoneError = validators.phone(data.phone)
      if (phoneError) errors.push(phoneError)
    }
    
    // Role validation
    if (!data.role || !['student', 'hostel_owner'].includes(data.role)) {
      errors.push({ field: 'role', message: 'Please select a valid role', code: 'INVALID_ROLE' })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Hostel creation validation
  hostelCreation: (data: {
    name: string
    description: string
    address: string
    universityId: string
    latitude?: number
    longitude?: number
    images: File[]
    roomTypes: Array<{
      name: string
      description: string
      capacity: number
      pricePerMonth: number
      totalCount: number
      amenities: string[]
    }>
  }): ValidationResult => {
    const errors: ValidationError[] = []
    
    // Basic info validation
    const nameError = validators.text(data.name, 'name', 2, 100)
    if (nameError) errors.push(nameError)
    
    const descriptionError = validators.text(data.description, 'description', 10, 2000)
    if (descriptionError) errors.push(descriptionError)
    
    const addressError = validators.text(data.address, 'address', 5, 500)
    if (addressError) errors.push(addressError)
    
    // University validation
    if (!data.universityId) {
      errors.push({ field: 'universityId', message: 'Please select a university', code: 'REQUIRED' })
    }
    
    // Location validation
    if (data.latitude !== undefined) {
      const latError = validators.number(data.latitude, 'latitude', -90, 90)
      if (latError) errors.push(latError)
    }
    
    if (data.longitude !== undefined) {
      const lngError = validators.number(data.longitude, 'longitude', -180, 180)
      if (lngError) errors.push(lngError)
    }
    
    // Images validation
    if (!data.images || data.images.length === 0) {
      errors.push({ field: 'images', message: 'At least one image is required', code: 'REQUIRED' })
    } else {
      data.images.forEach((file, index) => {
        const imageError = validators.file(file, ['image/jpeg', 'image/png', 'image/webp'], 5 * 1024 * 1024, `images[${index}]`)
        if (imageError) errors.push(imageError)
      })
    }
    
    // Room types validation
    if (!data.roomTypes || data.roomTypes.length === 0) {
      errors.push({ field: 'roomTypes', message: 'At least one room type is required', code: 'REQUIRED' })
    } else {
      data.roomTypes.forEach((room, index) => {
        const roomNameError = validators.text(room.name, `roomTypes[${index}].name`, 2, 50)
        if (roomNameError) errors.push(roomNameError)
        
        const capacityError = validators.number(room.capacity, `roomTypes[${index}].capacity`, 1, 10)
        if (capacityError) errors.push(capacityError)
        
        const priceError = validators.number(room.pricePerMonth, `roomTypes[${index}].pricePerMonth`, 0)
        if (priceError) errors.push(priceError)
        
        const countError = validators.number(room.totalCount, `roomTypes[${index}].totalCount`, 1)
        if (countError) errors.push(countError)
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Booking creation validation
  bookingCreation: (data: {
    hostelId: string
    roomTypeId: string
    startDate: string
    endDate: string
    message?: string
  }): ValidationResult => {
    const errors: ValidationError[] = []
    
    // Basic validation
    if (!data.hostelId) {
      errors.push({ field: 'hostelId', message: 'Hostel is required', code: 'REQUIRED' })
    }
    
    if (!data.roomTypeId) {
      errors.push({ field: 'roomTypeId', message: 'Room type is required', code: 'REQUIRED' })
    }
    
    // Date validation
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const startDateError = validators.date(data.startDate, 'startDate', today)
    if (startDateError) errors.push(startDateError)
    
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      
      if (end <= start) {
        errors.push({ field: 'endDate', message: 'End date must be after start date', code: 'INVALID_RANGE' })
      }
      
      // Maximum booking duration (1 year)
      const maxEndDate = new Date(start)
      maxEndDate.setFullYear(maxEndDate.getFullYear() + 1)
      
      if (end > maxEndDate) {
        errors.push({ field: 'endDate', message: 'Booking duration cannot exceed 1 year', code: 'TOO_LONG' })
      }
    }
    
    // Message validation (optional)
    if (data.message && data.message.length > 1000) {
      errors.push({ field: 'message', message: 'Message must be less than 1000 characters', code: 'TOO_LONG' })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Review validation
  review: (data: {
    rating: number
    comment: string
    bookingId?: string
  }): ValidationResult => {
    const errors: ValidationError[] = []
    
    // Rating validation
    const ratingError = validators.number(data.rating, 'rating', 1, 5)
    if (ratingError) errors.push(ratingError)
    
    // Comment validation
    const commentError = validators.text(data.comment, 'comment', 10, 1000)
    if (commentError) errors.push(commentError)
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Sanitization functions
export const sanitizers = {
  text: (text: string): string => {
    return text.trim().replace(/[<>]/g, '')
  },
  
  email: (email: string): string => {
    return email.trim().toLowerCase()
  },
  
  phone: (phone: string): string => {
    return phone.replace(/\s/g, '')
  },
  
  name: (name: string): string => {
    return name.trim().replace(/[<>]/g, '')
  }
}

// Error formatting utilities
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => error.message).join(', ')
}

export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(e => e.field === field)
  return error ? error.message : null
}

export const hasFieldError = (errors: ValidationError[], field: string): boolean => {
  return errors.some(e => e.field === field)
}
