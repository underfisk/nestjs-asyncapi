export interface ExampleObject {
  summary?: string
  description?: string
  value?: any
  externalValue?: string
}

export interface AsyncApiExamples {
  [key: string]: ExampleObject
}
