// src/app/delete-me/page.tsx
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Data Deletion Instructions | Astralis One",
  description: "Instructions on how to request the deletion of your data from Astralis One and associated Facebook applications.",
};

const DataDeletionPage = () => {
  const companyName = "Astralis One";
  const contactEmail = "privacy@astralisone.com";

  return (
    <div className="container mx-auto p-8 max-w-4xl min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-8 text-astralis-blue">Data Deletion Instructions</h1>
      
      <section className="mb-8 prose prose-slate max-w-none">
        <p className="text-lg mb-6">
          At {companyName}, we value your privacy and provide you with full control over the data you share with us. 
          In compliance with Facebook's Platform Policy, we provide this page to inform you how you can request the deletion 
          of your data associated with our application.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-slate-800">Option 1: Remove via Facebook Settings</h2>
        <p className="mb-4">
          You can remove our application's access to your data directly through your Facebook account. 
          Following these steps will trigger a data deletion request:
        </p>
        <ol className="list-decimal list-inside space-y-2 mb-6 ml-4">
          <li>Go to your Facebook Profile's **Settings & Privacy**.</li>
          <li>Click on **Settings**.</li>
          <li>In the left menu, click on **Apps and Websites**.</li>
          <li>Find **{companyName}** in the list.</li>
          <li>Click the **Remove** button next to the app name.</li>
          <li>(Optional) In the pop-up, you can also select the option to delete all posts, videos, or events {companyName} posted on your timeline.</li>
          <li>Click **Remove** again to confirm.</li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4 text-slate-800">Option 2: Manual Deletion Request</h2>
        <p className="mb-4">
          If you wish to have all your account data, including information not provided via Facebook, 
          permanently deleted from our servers, please follow these instructions:
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <p className="font-medium mb-2">Send an email to our privacy team:</p>
          <p className="text-astralis-blue font-bold text-xl mb-4">
            <a href={`mailto:${contactEmail}`} className="hover:underline">{contactEmail}</a>
          </p>
          <p className="text-sm text-slate-600">
            Please include "Data Deletion Request" in the subject line and provide your account email address. 
            We will process your request and delete all associated data within 30 days, 
            notifying you once the process is complete.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-slate-800">What data will be deleted?</h2>
        <p className="mb-4">
          Upon receiving a deletion request, we will permanently remove:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-6 ml-4">
          <li>Your profile information (name, email, profile picture).</li>
          <li>Any linked social media tokens and integration data.</li>
          <li>Your saved preferences and application settings.</li>
          <li>Any data imported from third-party integrations (unless specified otherwise).</li>
        </ul>

        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            For more information about how we handle your data, please visit our 
            <Link href="/privacy-policy" className="text-astralis-blue hover:underline ml-1">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default DataDeletionPage;
