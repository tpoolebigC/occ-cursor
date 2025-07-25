import { type Props as ClientProps, PropsContextProvider } from './client';
import { COMPONENT_TYPE } from './register';

type Props = ClientProps & { productId: number };

export const ProductDetail = ({ productId, ...props }: Props) => (
  <PropsContextProvider value={props}>
    <div
      data-snapshot-id={`product-detail-${productId}`}
      data-component-type={COMPONENT_TYPE}
    >
      {/* Product detail content would go here */}
    </div>
  </PropsContextProvider>
);
