import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/auth';
import { b2bClient } from '~/lib/b2b/client';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.b2bToken) {
      return NextResponse.json(
        { error: 'B2B authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      companyName, 
      phone, 
      acceptsMarketingEmails, 
      acceptsAbandonedCartEmails 
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Set the B2B token for API calls
    b2bClient.setCustomerToken(session.b2bToken);

    // Update the profile using B2B API
    // Note: The actual B2B API might have different endpoints for profile updates
    // This is a placeholder implementation
    const updatedProfile = await b2bClient.updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      companyName: companyName?.trim(),
      phone: phone?.trim(),
      acceptsMarketingEmails: acceptsMarketingEmails || false,
      acceptsAbandonedCartEmails: acceptsAbandonedCartEmails || false,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.b2bToken) {
      return NextResponse.json(
        { error: 'B2B authentication required' },
        { status: 401 }
      );
    }

    // Set the B2B token for API calls
    b2bClient.setCustomerToken(session.b2bToken);

    // Get profile information
    const profile = await b2bClient.getProfile();

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
} 