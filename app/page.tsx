"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import { ChevronLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  image: z.instanceof(File),
  language: z.string().min(1, {
    message: "Language is required",
  }),
});

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [result, setResult] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: new File([], ""),
      language: "eng",
    },
  });

  function onSubmit({ image, language }: z.infer<typeof formSchema>) {
    if (!image) {
      return;
    }

    const imageUrl = URL.createObjectURL(image);

    setIsLoading(true);

    Tesseract.recognize(imageUrl, language, {
      logger: (m) => {
        console.log(m);

        if (m.status === "recognizing text") {
          setProgress(Math.round(m.progress));
        }
      },
    })
      .catch((err) => {
        console.error(err);
      })
      .then((result) => {
        setResult(result?.data?.text || "");
        setIsLoading(false);
      });
  }

  let body = null;

  if (isLoading) {
    body = (
      <>
        <Progress value={progress} max={100} className="max-w-lg mx-auto">
          {progress}%
        </Progress>

        <div className="text-center mt-5">Converting: {progress} %</div>
      </>
    );
  } else if (result) {
    body = (
      <>
        <Textarea
          className="mt-5"
          rows={8}
          value={result}
          onChange={(e) => setResult(e.target.value)}
        />

        <Button
          className="mt-2"
          onClick={() => {
            setResult("");
            setProgress(0);
          }}
        >
          <ChevronLeft className="mr-2" />
          Scan another image
        </Button>
      </>
    );
  } else {
    body = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <Input
                    accept="image/*"
                    multiple={false}
                    type="file"
                    onChange={(e) => {
                      field.onChange(e.target.files ? e.target.files[0] : null);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="eng">English</SelectItem>
                    <SelectItem value="rus">Russian</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    );
  }

  return (
    <main className="container flex justify-center items-center h-screen">
      <div className="p-8 border rounded-md w-full">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Optical character recognition
        </h2>

        <div className="mt-10">{body}</div>
      </div>
    </main>
  );
}
