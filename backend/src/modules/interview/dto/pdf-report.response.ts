import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PdfReportResponse {
  @Field(() => String, { description: 'HTML content for PDF generation' })
  htmlContent: string;

  @Field(() => String, { description: 'Suggested filename for the PDF' })
  filename: string;

  @Field(() => String, { description: 'PDF title' })
  title: string;

  @Field(() => String, { description: 'Report ID' })
  reportId: string;
}