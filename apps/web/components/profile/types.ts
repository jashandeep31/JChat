export interface Attachment {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  model: string
  createdAt: string
}

export interface Model {
  id: string
  name: string
}

export interface FeatureCardProps {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}
