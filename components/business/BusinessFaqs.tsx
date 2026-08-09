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
    <Card
      id="perguntas-frequentes"
      tabIndex={-1}
      className="min-w-0 scroll-mt-32 overflow-hidden outline-none"
    >
      <CardHeader>
        <CardTitle>Perguntas frequentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="min-w-0">
              <AccordionTrigger className="min-w-0 wrap-anywhere">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-line wrap-anywhere text-muted-foreground">
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
