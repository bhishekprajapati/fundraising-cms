import {
  BoldFeature,
  ItalicFeature,
  ParagraphFeature,
  lexicalEditor,
  UnderlineFeature,
} from '@payloadcms/richtext-lexical'

export const defaultLexical = lexicalEditor({
  features: [ParagraphFeature(), UnderlineFeature(), BoldFeature(), ItalicFeature()],
})
