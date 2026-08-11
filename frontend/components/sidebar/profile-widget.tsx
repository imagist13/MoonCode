import { Github, Twitter, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export function ProfileWidget() {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-20 bg-gradient-to-r from-moon/40 via-accent/30 to-primary/30" />
      <div className="-mt-8 flex flex-col items-center px-6 pb-6 text-center">
        <Avatar className="h-16 w-16 border-4 border-card shadow">
          <AvatarImage
            src={siteConfig.author.avatar}
            alt={siteConfig.author.name}
          />
          <AvatarFallback>{siteConfig.author.name[0]}</AvatarFallback>
        </Avatar>
        <p className="mt-3 text-base font-semibold tracking-tight">
          {siteConfig.author.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {siteConfig.author.handle}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {siteConfig.author.bio}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <a
            href={siteConfig.social[0].href}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground/70 hover:bg-muted hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href={siteConfig.social[1].href}
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground/70 hover:bg-muted hover:text-foreground"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href="mailto:hello@moon.dev"
            aria-label="Email"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground/70 hover:bg-muted hover:text-foreground"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </Card>
  );
}
