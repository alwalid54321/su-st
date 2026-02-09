'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const defaultSlides = [
    '/images/gallery/slide1.svg',
    '/images/gallery/slide2.svg',
    '/images/gallery/slide3.svg',
    '/images/gallery/slide4.svg',
    '/images/gallery/slide5.svg',
]

interface GalleryImage {
    id: number
    imageUrl: string
    title: string
    description?: string
    isActive: boolean
}

export default function GallerySlider() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [images, setImages] = useState<GalleryImage[]>([])
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        async function fetchImages() {
            try {
                const res = await fetch('/api/gallery')
                if (res.ok) {
                    const data: GalleryImage[] = await res.json()
                    if (data.length > 0) {
                        setImages(data)
                    } else {
                        // Use default slides if no active images
                        setImages(defaultSlides.map((url, idx) => ({
                            id: idx,
                            imageUrl: url,
                            title: `Gallery ${idx + 1}`,
                            isActive: true
                        })))
                    }
                }
            } catch (error) {
                console.error('Failed to fetch gallery images', error)
                // Fallback to default slides
                setImages(defaultSlides.map((url, idx) => ({
                    id: idx,
                    imageUrl: url,
                    title: `Gallery ${idx + 1}`,
                    isActive: true
                })))
            }
        }
        fetchImages()
    }, [])

    // Auto-play slideshow
    useEffect(() => {
        if (!isAutoPlaying || images.length === 0) return
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length)
        }, 5000) // Change slide every 5 seconds
        return () => clearInterval(timer)
    }, [isAutoPlaying, images.length])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length)
        setIsAutoPlaying(false)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        setIsAutoPlaying(false)
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
        setIsAutoPlaying(false)
    }

    if (images.length === 0) return null

    return (
        <section className="gallery-slideshow-section">
            <div className="slideshow-container">
                {/* Slides */}
                <div className="slides-wrapper">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className={`slide ${index === currentSlide ? 'active' : ''} ${index === currentSlide - 1 || (currentSlide === 0 && index === images.length - 1)
                                ? 'prev'
                                : ''
                                } ${index === currentSlide + 1 || (currentSlide === images.length - 1 && index === 0)
                                    ? 'next'
                                    : ''
                                }`}
                        >
                            <div className="slide-image-wrapper">
                                {/* Blurred background layer to fill gaps */}
                                <Image
                                    src={image.imageUrl}
                                    alt=""
                                    fill
                                    className="slide-image-blur"
                                    priority={index < 2}
                                    unoptimized={true}
                                    aria-hidden="true"
                                />
                                {/* Main image showing full width/edges */}
                                <Image
                                    src={image.imageUrl}
                                    alt={image.title}
                                    fill
                                    className="slide-image-main"
                                    priority={index < 2}
                                    unoptimized={true}
                                />
                            </div>
                            <div className="slide-overlay"></div>
                            <div className="slide-content">
                                <h2 className="slide-title">{image.title}</h2>
                                {image.description && (
                                    <p className="slide-description">{image.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button
                    className="slideshow-nav-btn prev"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                >
                    <i className="fas fa-chevron-left"></i>
                </button>
                <button
                    className="slideshow-nav-btn next"
                    onClick={nextSlide}
                    aria-label="Next slide"
                >
                    <i className="fas fa-chevron-right"></i>
                </button>

                {/* Dots Navigation */}
                <div className="slideshow-dots">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>

                {/* Play/Pause Button */}
                <button
                    className="slideshow-play-pause"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                    <i className={`fas ${isAutoPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                </button>
            </div>
        </section>
    )
}
