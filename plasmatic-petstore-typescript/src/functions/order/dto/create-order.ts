export class CreateOrderDTO {
    quantity: number;
    products: CreateProductsDTO[];
}

export class CreateProductsDTO {
    petid: string;
    quantity: number;
}