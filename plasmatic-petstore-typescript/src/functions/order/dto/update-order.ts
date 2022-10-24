export class UpdateOrderDTO {
    id: string;
    quantity: number;
    products: UpdateProductDTO[];
}

export class UpdateProductDTO {
    petid: string;
    quantity: number;
}