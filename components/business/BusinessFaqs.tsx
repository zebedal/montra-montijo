import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessFaq } from "@/lib/queries/getBusinessBySlug";

type Props = {
  faqs: BusinessFaq[];
};

export function BusinessFaqs({ faqs }: Props) {
  if (faqs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perguntas frequentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-line text-muted-foreground">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
