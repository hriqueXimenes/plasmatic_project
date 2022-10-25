export class CreateOrderDTO {
    products: CreateProductsDTO[];
}

export class CreateProductsDTO {
    petid: string;
    quantity: number;
}