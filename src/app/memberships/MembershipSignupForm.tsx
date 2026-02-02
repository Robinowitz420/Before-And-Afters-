'use client'

import { useState } from 'react'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MembershipSignupData {
  // Avatar
  avatar?: File

  // Names
  firstName: string
  middleName?: string
  lastName: string
  displayName: string
  partyNames?: string
  pronouns?: string

  // Contact
  email: string
  phone: string
  instagram?: string
  socialLinks?: string

  // Addresses
  homeAddress: string
  homeNeighborhood: string
  additionalAddresses?: Array<{
    address: string
    neighborhood: string
    purpose: string
  }>

  // Style Profile
  styleDescription: string
  signatureColor: string
  signaturePatterns?: string
  sizing: string

  // Shopping Habits
  wardrobeSources: string[]
  favoriteBrands?: string

  // Satisfaction & Interests
  wardrobeSatisfaction: number
  makesClothes: boolean
  borrowingExcitement: string

  // Work & Social
  work: string
  artForms?: string
  partyVibe: string
  sleepSchedule: string

  // Power Letter
  powerLetter: string

  // Membership
  membershipTier: MembershipTier
}

type SignupStep = 'identity' | 'contact' | 'addresses' | 'style' | 'habits' | 'interests' | 'social' | 'membership'

const WARDROBE_SOURCES = [
  'Shopping at fancy stores',
  'Shopping at fast fashion stores',
  'Shopping at thrift stores',
  'Shopping vintage and consignment',
  'Shopping online',
  'Buying from designers and artisans',
  'Markets and street fairs',
  'Sample sales',
  'Street finds',
  'Things get passed down from family',
  'Clothing rental services',
  'I have no idea!?'
]

const POWER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function MembershipSignupForm({
  initialTier = 'Eeeehs',
  onClose,
  onSuccess
}: {
  initialTier?: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('identity')
  const [formData, setFormData] = useState<MembershipSignupData>({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    homeAddress: '',
    homeNeighborhood: '',
    styleDescription: '',
    signatureColor: '',
    sizing: '',
    wardrobeSources: [],
    wardrobeSatisfaction: 5,
    makesClothes: false,
    borrowingExcitement: '',
    work: '',
    partyVibe: '',
    sleepSchedule: '',
    powerLetter: '',
    membershipTier: initialTier
  })

  const steps: SignupStep[] = ['identity', 'contact', 'addresses', 'style', 'habits', 'interests', 'social', 'membership']
  const currentStepIndex = steps.indexOf(currentStep)

  const updateFormData = (updates: Partial<MembershipSignupData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    // Only run on client side
    if (typeof window === 'undefined') return

    try {
      const submitData = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'avatar' && value instanceof File) {
          submitData.append('avatar', value)
        } else if (key === 'additionalAddresses' && Array.isArray(value)) {
          submitData.append('additionalAddresses', JSON.stringify(value))
        } else if (key === 'wardrobeSources' && Array.isArray(value)) {
          submitData.append('wardrobeSources', JSON.stringify(value))
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          submitData.append(key, String(value))
        }
      })

      const response = await fetch('/api/memberships', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create membership')
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating membership:', error)
      // TODO: Show error to user
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'identity':
        return <IdentityStep formData={formData} updateFormData={updateFormData} />
      case 'contact':
        return <ContactStep formData={formData} updateFormData={updateFormData} />
      case 'addresses':
        return <AddressesStep formData={formData} updateFormData={updateFormData} />
      case 'style':
        return <StyleStep formData={formData} updateFormData={updateFormData} />
      case 'habits':
        return <HabitsStep formData={formData} updateFormData={updateFormData} />
      case 'interests':
        return <InterestsStep formData={formData} updateFormData={updateFormData} />
      case 'social':
        return <SocialStep formData={formData} updateFormData={updateFormData} />
      case 'membership':
        return <MembershipStep formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'identity':
        return formData.firstName && formData.lastName && formData.displayName && formData.email && formData.phone
      case 'contact':
        return true // Optional fields
      case 'addresses':
        return formData.homeAddress && formData.homeNeighborhood
      case 'style':
        return formData.styleDescription && formData.signatureColor && formData.sizing
      case 'habits':
        return formData.wardrobeSources.length > 0
      case 'interests':
        return formData.borrowingExcitement
      case 'social':
        return formData.work && formData.partyVibe && formData.sleepSchedule && formData.powerLetter
      case 'membership':
        return formData.membershipTier
      default:
        return false
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header - Fixed at top */}
      <div className="bg-white border-b sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Join the Endless Closet</h1>
            <p className="text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}: {currentStep.replace('-', ' ').toUpperCase()}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-3 mt-4">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(steps[currentStepIndex - 1])}
              disabled={currentStepIndex === 0}
              className="px-8"
            >
              ← Previous
            </Button>

            {!canContinue(currentStep) && (
              <div className="text-sm text-muted-foreground text-center flex-1 mx-8">
                {currentStep === 'identity' && 'Please fill in your name and contact information'}
                {currentStep === 'contact' && 'Please complete your contact details'}
                {currentStep === 'addresses' && 'Please provide your home address'}
                {currentStep === 'style' && 'Please describe your style preferences'}
                {currentStep === 'habits' && 'Please select how you build your wardrobe'}
                {currentStep === 'interests' && 'Please share what excites you about borrowing'}
                {currentStep === 'social' && 'Please tell us about your work and social preferences'}
                {currentStep === 'membership' && 'Please select your membership tier'}
              </div>
            )}

            {currentStepIndex === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!canContinue(currentStep)}
                className="px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Join the Magic ✨
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(steps[currentStepIndex + 1])}
                disabled={!canContinue(currentStep)}
                className="px-8"
              >
                Next →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components
function IdentityStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🙂 Let&apos;s Get to Know You</h2>
        <p className="text-muted-foreground">Start building your magical profile in the endless closet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avatar Section */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-center">Upload Your Avatar</h3>
          <div className="space-y-4">
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-purple-400 transition-colors">
                  {formData.avatar ? (
                    <div className="text-green-600 text-2xl">✓</div>
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-2xl mb-1">📷</div>
                      <div className="text-xs">Click to upload</div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) updateFormData({ avatar: file })
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground text-center">Upload a selfie or photo that represents you</p>
            {formData.avatar && (
              <p className="text-sm text-green-600 text-center">✓ {formData.avatar.name} uploaded</p>
            )}
          </div>
        </div>

        {/* Names Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Names</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">First *</label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData({ firstName: e.target.value })}
                  placeholder="First name"
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium mb-1">Middle</label>
                <input
                  id="middleName"
                  type="text"
                  value={formData.middleName || ''}
                  onChange={(e) => updateFormData({ middleName: e.target.value })}
                  placeholder="Middle name"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last *</label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData({ lastName: e.target.value })}
                  placeholder="Last name"
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-1">Display Name *</label>
              <input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => updateFormData({ displayName: e.target.value })}
                placeholder="What should we call you?"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="pronouns" className="block text-sm font-medium mb-1">Pronouns</label>
              <input
                id="pronouns"
                type="text"
                value={formData.pronouns || ''}
                onChange={(e) => updateFormData({ pronouns: e.target.value })}
                placeholder="she/her, they/them, etc."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="partyNames" className="block text-sm font-medium mb-1">Party Names / Nicknames</label>
            <input
              id="partyNames"
              type="text"
              value={formData.partyNames || ''}
              onChange={(e) => updateFormData({ partyNames: e.target.value })}
              placeholder="Any fun alternative names or party personas?"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">📱 How Can We Reach You?</h2>
        <p className="text-muted-foreground">Your contact information helps us connect and communicate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Primary Contact */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">📧 Primary Contact</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address *</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="your.email@example.com"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="(555) 123-4567"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Social Presence */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">🌐 Social Presence</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium mb-1">Instagram Handle</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 rounded-l-md bg-gray-50 text-sm">@</span>
                <input
                  id="instagram"
                  type="text"
                  value={formData.instagram || ''}
                  onChange={(e) => updateFormData({ instagram: e.target.value })}
                  placeholder="yourhandle"
                  className="flex-1 rounded-r-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div>
              <label htmlFor="socialLinks" className="block text-sm font-medium mb-1">Other Social Links</label>
              <textarea
                id="socialLinks"
                value={formData.socialLinks || ''}
                onChange={(e) => updateFormData({ socialLinks: e.target.value })}
                placeholder="Twitter: @handle&#10;TikTok: @handle&#10;Website: yoursite.com&#10;Etc."
                rows={4}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">One link per line with platform name</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddressesStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🏠 Where Are You?</h2>
        <p className="text-muted-foreground">Help us understand your location for delivery and events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Home Address */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            🏠 Primary Address
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="homeAddress" className="block text-sm font-medium mb-1">Street Address *</label>
              <input
                id="homeAddress"
                type="text"
                value={formData.homeAddress}
                onChange={(e) => updateFormData({ homeAddress: e.target.value })}
                placeholder="123 Main St, Apt 4B"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="homeNeighborhood" className="block text-sm font-medium mb-1">Neighborhood/Area *</label>
              <input
                id="homeNeighborhood"
                type="text"
                value={formData.homeNeighborhood}
                onChange={(e) => updateFormData({ homeNeighborhood: e.target.value })}
                placeholder="Brooklyn, Bushwick"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Additional Addresses */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            🗺️ Other Locations
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Additional Addresses</label>
              <p className="text-sm text-muted-foreground mb-3">
                Places you spend significant time (work, partner, etc.)
              </p>
              <textarea
                value={formData.additionalAddresses?.map(addr => `${addr.purpose}: ${addr.address}, ${addr.neighborhood}`).join('\n') || ''}
                onChange={(e) => {
                  // Simple parsing - in a real app you'd want better handling
                  const lines = e.target.value.split('\n')
                  const addresses = lines.map(line => {
                    const [purpose, ...addressParts] = line.split(': ')
                    const addressText = addressParts.join(': ')
                    // Try to extract neighborhood from address
                    const parts = addressText.split(', ')
                    const neighborhood = parts[parts.length - 1] || ''
                    const address = parts.slice(0, -1).join(', ') || addressText
                    return {
                      purpose: purpose || '',
                      address: address || '',
                      neighborhood: neighborhood || ''
                    }
                  }).filter(addr => addr.purpose || addr.address)
                  updateFormData({ additionalAddresses: addresses })
                }}
                placeholder="Work: 456 Office Blvd, Manhattan&#10;Partner: 789 Love St, Queens&#10;Gym: 321 Fitness Ave, Brooklyn"
                rows={6}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Format: Location: Address, Neighborhood
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StyleStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">💃 Your Style Story</h2>
        <p className="text-muted-foreground">Tell us about your unique fashion personality</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Style Description */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">✨ Style Identity</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="styleDescription" className="block text-sm font-medium mb-1">How would you describe your style? *</label>
              <textarea
                id="styleDescription"
                value={formData.styleDescription}
                onChange={(e) => updateFormData({ styleDescription: e.target.value })}
                placeholder="Goth, bohemian, minimalist, maximalist, streetwear, vintage, etc."
                rows={4}
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            <div>
              <label htmlFor="signatureColor" className="block text-sm font-medium mb-1">Signature Color *</label>
              <input
                id="signatureColor"
                type="text"
                value={formData.signatureColor}
                onChange={(e) => updateFormData({ signatureColor: e.target.value })}
                placeholder="Black, electric blue, rainbow, earth tones, etc."
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Style Details */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">🎨 Style Details</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="signaturePatterns" className="block text-sm font-medium mb-1">Signature Patterns & Accents</label>
              <textarea
                id="signaturePatterns"
                value={formData.signaturePatterns || ''}
                onChange={(e) => updateFormData({ signaturePatterns: e.target.value })}
                placeholder="Stripes, florals, polka dots, hats, boots, jewelry, etc."
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            <div>
              <label htmlFor="sizing" className="block text-sm font-medium mb-1">Sizing Range *</label>
              <select
                id="sizing"
                value={formData.sizing}
                onChange={(e) => updateFormData({ sizing: e.target.value })}
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select your size range</option>
                <option value="XXS">XXS (0-2)</option>
                <option value="XS">XS (2-4)</option>
                <option value="S">S (4-6)</option>
                <option value="M">M (6-8)</option>
                <option value="L">L (8-10)</option>
                <option value="XL">XL (10-12)</option>
                <option value="XXL">XXL (12-14)</option>
                <option value="1X-3X">1X-3X (14-18)</option>
                <option value="Custom">Custom/Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HabitsStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🛍️ Your Wardrobe Journey</h2>
        <p className="text-muted-foreground">How do you build and maintain your style?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wardrobe Sources */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">📦 How You Shop</h3>
          <p className="text-sm text-muted-foreground mb-4">Select all that apply to your wardrobe building</p>
          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
            {WARDROBE_SOURCES.map((source) => (
              <div key={source} className="flex items-center space-x-3 p-2 rounded hover:bg-white/50">
                <input
                  type="checkbox"
                  id={source}
                  checked={formData.wardrobeSources.includes(source)}
                  onChange={(e) => {
                    const checked = e.target.checked
                    const sources = checked
                      ? [...formData.wardrobeSources, source]
                      : formData.wardrobeSources.filter(s => s !== source)
                    updateFormData({ wardrobeSources: sources })
                  }}
                  className="rounded border focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor={source} className="text-sm cursor-pointer flex-1">{source}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Brands & Satisfaction */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">🏪 Favorite Brands & Stores</h3>
            <label htmlFor="favoriteBrands" className="block text-sm font-medium mb-2">Your go-to brands, stores, websites</label>
            <textarea
              id="favoriteBrands"
              value={formData.favoriteBrands || ''}
              onChange={(e) => updateFormData({ favoriteBrands: e.target.value })}
              placeholder="Gucci, ASOS, local thrift stores, Depop, etc."
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">📊 Wardrobe Satisfaction</h3>
            <label className="block text-sm font-medium mb-3">How satisfied are you with your current wardrobe?</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>1 (Not satisfied)</span>
                <span>10 (Very satisfied)</span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => updateFormData({ wardrobeSatisfaction: rating })}
                    className={`aspect-square text-sm font-medium rounded border transition-colors ${
                      formData.wardrobeSatisfaction === rating
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white hover:bg-purple-100 border-gray-300'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              {formData.wardrobeSatisfaction && (
                <p className="text-sm text-center text-purple-600 font-medium">
                  Selected: {formData.wardrobeSatisfaction}/10
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InterestsStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🎨 Your Creative World</h2>
        <p className="text-muted-foreground">Tell us about your hands-on creativity and what draws you to borrowing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Crafting */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">🧵 Do You Create?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Do you make clothes, upcycle, craft, or create fashion?
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => updateFormData({ makesClothes: true })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.makesClothes === true
                  ? 'bg-green-500 text-white border-green-500 shadow-lg'
                  : 'bg-white hover:bg-green-50 border-gray-200'
              }`}
            >
              <div className="text-2xl mb-2">✅</div>
              <div className="font-medium">Yes!</div>
              <div className="text-xs opacity-80">I create & craft</div>
            </button>
            <button
              type="button"
              onClick={() => updateFormData({ makesClothes: false })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.makesClothes === false
                  ? 'bg-gray-500 text-white border-gray-500 shadow-lg'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-2xl mb-2">❌</div>
              <div className="font-medium">No</div>
              <div className="text-xs opacity-80">I don&apos;t create</div>
            </button>
          </div>
        </div>

        {/* Excitement About Borrowing */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">✨ Why Borrow?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            What excites you most about endless clothing access?
          </p>
          <label htmlFor="borrowingExcitement" className="block text-sm font-medium mb-2">Share your excitement *</label>
          <textarea
            id="borrowingExcitement"
            value={formData.borrowingExcitement}
            onChange={(e) => updateFormData({ borrowingExcitement: e.target.value })}
            placeholder="Trying new styles without commitment, sustainability, saving money, creative experimentation, access to luxury pieces, etc."
            rows={8}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Help us understand what makes the endless closet magical for you
          </p>
        </div>
      </div>
    </div>
  )
}

function SocialStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🌟 Your World & Energy</h2>
        <p className="text-muted-foreground">Complete your profile with your life rhythm and creative spirit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Work & Art */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">💼 Your Work</h3>
            <label htmlFor="work" className="block text-sm font-medium mb-2">What do you do? *</label>
            <textarea
              id="work"
              value={formData.work}
              onChange={(e) => updateFormData({ work: e.target.value })}
              placeholder="Your job, profession, passion project, or how you spend your days"
              rows={3}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">🎭 Your Art & Talents</h3>
            <label htmlFor="artForms" className="block text-sm font-medium mb-2">Creative expressions & skills</label>
            <textarea
              id="artForms"
              value={formData.artForms || ''}
              onChange={(e) => updateFormData({ artForms: e.target.value })}
              placeholder="Painting, music, dance, writing, photography, cooking, crafting, etc."
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>

        {/* Social Life & Energy */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">🎉 Social Energy</h3>
            <label htmlFor="partyVibe" className="block text-sm font-medium mb-2">Party/social vibe & favorite spots *</label>
            <textarea
              id="partyVibe"
              value={formData.partyVibe}
              onChange={(e) => updateFormData({ partyVibe: e.target.value })}
              placeholder="Club kid energy, cozy home gatherings, outdoor adventures, art openings, etc."
              rows={4}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">🌙 Sleep Rhythm</h3>
            <label htmlFor="sleepSchedule" className="block text-sm font-medium mb-2">Your natural sleep schedule *</label>
            <textarea
              id="sleepSchedule"
              value={formData.sleepSchedule}
              onChange={(e) => updateFormData({ sleepSchedule: e.target.value })}
              placeholder="Early bird (up at 6am), night owl (up at 2pm), consistent 10pm-6am, etc."
              rows={3}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="bg-gradient-to-br from-magenta-50 to-purple-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">🔮 Power Letter</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Choose the letter that resonates most with your energy *
            </p>
            <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
              {POWER_LETTERS.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => updateFormData({ powerLetter: letter })}
                  className={`aspect-square rounded-lg border-2 text-lg font-bold transition-all ${
                    formData.powerLetter === letter
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg scale-105'
                      : 'bg-white hover:bg-purple-50 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
            {formData.powerLetter && (
              <p className="text-center mt-3 text-purple-600 font-medium">
                ✨ Your power letter: {formData.powerLetter}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MembershipStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🪄 Choose Your Magical Path</h2>
        <p className="text-muted-foreground">Select the membership tier that calls to your endless closet journey</p>
      </div>

      {/* Deposit Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="text-2xl">💰</div>
          <div className="text-center">
            <h3 className="font-semibold text-yellow-800">Important: $25 (5Ġ) Security Deposit</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Required upfront for all memberships. Ensures our trust-based community thrives.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(MEMBERSHIP_LEVELS).map(([tier, level]) => {
          const selected = formData.membershipTier === tier
          return (
            <div
              key={tier}
              className={`cursor-pointer transition-all duration-300 rounded-xl border-2 p-6 ${
                selected
                  ? 'ring-4 ring-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-xl scale-105'
                  : 'hover:shadow-lg hover:scale-102 border-gray-200 bg-white hover:border-purple-200'
              }`}
              onClick={() => updateFormData({ membershipTier: tier as MembershipTier })}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-1">{level.name.split(' - ')[0]}</h3>
                <p className="text-sm text-muted-foreground italic">
                  {level.name.split(' - ')[1]}
                </p>
                <div className="text-3xl font-bold glitcoin-text mt-3">
                  {level.glitcoinValue}Ġ/month
                </div>
                <div className="text-sm text-muted-foreground">
                  ${level.monthlyPrice}/month
                </div>
              </div>

              {/* Key Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">👗 Items at once:</span>
                  <span className="font-semibold">{level.maxItems}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">🎁 Free Check Meowt:</span>
                  <span className="font-semibold">{level.freeCheckMeowtItems}/month</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">💎 Free Glitcoins:</span>
                  <span className="font-semibold">{level.freeMonthlyGlitcoins}/month</span>
                </div>
              </div>

              {/* Selection Indicator */}
              {selected && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    <span>✨</span>
                    <span>Selected Path</span>
                    <span>✨</span>
                  </div>
                </div>
              )}

              {/* Hover state hint */}
              {!selected && (
                <div className="text-center text-xs text-muted-foreground mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to select this path
                </div>
              )}
            </div>
          )
        })}
      </div>

      {formData.membershipTier && (
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
          <h3 className="font-semibold text-center mb-4">
            🎉 Welcome to the {MEMBERSHIP_LEVELS[formData.membershipTier as keyof typeof MEMBERSHIP_LEVELS].name.split(' - ')[0]} path!
          </h3>
          <p className="text-sm text-center text-muted-foreground">
            You&apos;re about to join a community that believes clothing is sentient and transformation is endless.
          </p>
        </div>
      )}
    </div>
  )
}