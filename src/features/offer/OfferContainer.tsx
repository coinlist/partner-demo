'use client';

import type { OfferDetail } from '@passage-cl/react/universal';
import { OfferCheckoutContainer } from '@/features/checkout/OfferCheckoutContainer';
import { OfferView } from '@/features/offer/OfferView';
import {
  type SignInByOption,
  useOfferViewModel,
} from '@/features/offer/useOfferViewModel';
import { useOfferSignInMethod } from '@/lib/providers/SignInMethodProvider';

export interface Props {
  /**
   * What the server read with the partner token for a visitor with no CoinList
   * account: signed out, or signed in with a wallet.
   */
  withoutAccount?: {
    offerDetail: OfferDetail | undefined;
    signInByOption: SignInByOption;
  };
}

export function OfferContainer({ withoutAccount }: Props) {
  const { state, onEvent, checkout } = useOfferViewModel(
    withoutAccount?.offerDetail
  );
  const selectedOptionId =
    state.type === 'CONTENT' ? state.selectedOptionId : null;
  // The header offers the sign-in the selected option takes, or the CoinList
  // login when its requirements did not load.
  useOfferSignInMethod(
    (withoutAccount &&
      selectedOptionId &&
      withoutAccount.signInByOption[selectedOptionId]) ||
      'coinlist'
  );

  // The checkout takes over the whole page rather than rendering beside the
  // offer, and unmounting the offer view is what stops its requests while it
  // is off screen.
  if (checkout.type === 'OPEN') {
    return (
      <OfferCheckoutContainer
        offerDetail={checkout.offerDetail}
        optionId={checkout.optionId}
        side={checkout.side}
        onBack={() => onEvent({ type: 'ON_CHECKOUT_BACK' })}
      />
    );
  }

  return (
    <OfferView
      state={state}
      onEvent={onEvent}
      signInByOption={withoutAccount?.signInByOption ?? null}
    />
  );
}
