import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Export all triggers
export const onOfferCreated = functions.firestore
  .document("offers/{offerId}")
  .onCreate((snap, context) => {
    // TODO: Trigger Algolia indexing
    return null;
  });

export const onOfferUpdated = functions.firestore
  .document("offers/{offerId}")
  .onUpdate((change, context) => {
    // TODO: Trigger Algolia update
    return null;
  });
