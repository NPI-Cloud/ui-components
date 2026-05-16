export enum BlockType {
	Hero = 'hero',
	Text = 'text',
	Image = 'image',
	Gallery = 'gallery',
	Video = 'video',
	Cta = 'cta',
	Features = 'features',
	Testimonials = 'testimonials',
	Faq = 'faq',
	Form = 'form',
	Divider = 'divider',
	Html = 'html',
	Dynamic = 'dynamic',
}

import type { TextSize, TextWeight } from './components/Text'

export type TextVariant = TextSize

export interface BaseBlockData {
	id: string
	type: BlockType
	order: number
}

export interface HeroBlockData extends BaseBlockData {
	type: BlockType.Hero
	heading: string
	subheading?: string
	imageUrl?: string
	ctaLabel?: string
	ctaUrl?: string
}

export interface TextBlockData extends BaseBlockData {
	type: BlockType.Text
	textVariant: TextVariant
	textWeight: TextWeight
	content: string
}

export interface ImageBlockData extends BaseBlockData {
	type: BlockType.Image
	imageUrl: string
	alt?: string
	caption?: string
}

export interface GalleryBlockData extends BaseBlockData {
	type: BlockType.Gallery
	images: Array<{ url: string; alt?: string }>
}

export interface VideoBlockData extends BaseBlockData {
	type: BlockType.Video
	videoUrl: string
	caption?: string
}

export interface CtaBlockData extends BaseBlockData {
	type: BlockType.Cta
	heading: string
	body?: string
	buttonLabel: string
	buttonUrl: string
}

export interface FeaturesBlockData extends BaseBlockData {
	type: BlockType.Features
	heading?: string
	items: Array<{ icon?: string; title: string; description: string }>
}

export interface TestimonialsBlockData extends BaseBlockData {
	type: BlockType.Testimonials
	heading?: string
	items: Array<{ quote: string; author: string; role?: string; avatarUrl?: string }>
}

export interface FaqBlockData extends BaseBlockData {
	type: BlockType.Faq
	heading?: string
	items: Array<{ question: string; answer: string }>
}

export interface FormBlockData extends BaseBlockData {
	type: BlockType.Form
	formId: string
	heading?: string
}

export interface DividerBlockData extends BaseBlockData {
	type: BlockType.Divider
}

export interface HtmlBlockData extends BaseBlockData {
	type: BlockType.Html
	html: string
}

export interface DynamicBlockData extends BaseBlockData {
	type: BlockType.Dynamic
	dynamicSource: string
	dynamicFilter?: Record<string, unknown>
	dynamicSort?: string
	dynamicLimit?: number
}

export type AnyBlockData =
	| HeroBlockData
	| TextBlockData
	| ImageBlockData
	| GalleryBlockData
	| VideoBlockData
	| CtaBlockData
	| FeaturesBlockData
	| TestimonialsBlockData
	| FaqBlockData
	| FormBlockData
	| DividerBlockData
	| HtmlBlockData
	| DynamicBlockData
