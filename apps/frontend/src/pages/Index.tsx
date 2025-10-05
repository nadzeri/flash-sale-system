import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FLASH_SALE_UI_BY_STATUS,
  FlashSaleUIBase,
} from "@/constants/flashSaleUI";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useToast } from "@/hooks/use-toast";
import { Zap, LogOut } from "lucide-react";
import { flashSaleApi } from "@/apis/flashSaleApi";

const mockProduct = {
  name: "iPhone 17 Pro Max",
  description:
    "Experience the next generation performance with the iPhone 17 Pro Max — an ultra‑bright ProMotion display.",
  image: "/iPhone-17-Pro-Max.png",
  originalPrice: 1499.0,
  discountPercent: 90,
  salePrice: 149.9,
  savings: 1349.1,
};

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: flashSale } = useQuery({
    queryKey: ["flash-sale", "current"],
    queryFn: flashSaleApi.fetchCurrentFlashSale,
    staleTime: 30000,
  });


  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const getButtonLabel = (base: FlashSaleUIBase) => {
    if (base.buttonLabel !== null) {
      return base.buttonLabel;
    }
    // Fallback to empty string if optional labels are missing
    return user
      ? base.buttonLabelWhenLoggedIn ?? ""
      : base.buttonLabelWhenLoggedOut ?? "";
  };

  const saleUI = useMemo(() => {
    const statusKey = (flashSale?.status ??
      "none") as keyof typeof FLASH_SALE_UI_BY_STATUS;
    const base = FLASH_SALE_UI_BY_STATUS(flashSale)[
      statusKey
    ] as FlashSaleUIBase;
    const buttonLabel = getButtonLabel(base);
    const start =
      flashSale?.startDate instanceof Date ? flashSale.startDate : new Date();
    const end =
      flashSale?.endDate instanceof Date ? flashSale.endDate : new Date();
    const timerEndTime = base?.useStartTime ? start : end;

    return { ...base, buttonLabel, timerEndTime } as const;
  }, [flashSale, user]);

  const handlePurchase = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    toast({
      title: "Purchase Successful!",
      description: "Your order has been placed.",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logout */}
        <div className="fixed right-14">
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>

        {/* Flash Sale Banner */}
        <div className="text-center mb-8">
          <Badge className="mb-4 text-lg px-6 py-2 bg-accent text-accent-foreground animate-pulse">
            <Zap className="mr-2 h-5 w-5" />
            {saleUI.badgeText}
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {saleUI.headingText}
          </h1>
          {saleUI.showTimer && (
            <>
              <p className="text-xl text-muted-foreground mb-4">
                {saleUI.timerHeading}
              </p>
              <CountdownTimer endTime={saleUI.timerEndTime} />
            </>
          )}
        </div>

        {/* Product Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-6 md:p-12">
                <img
                  src={mockProduct.image}
                  alt="iPhone 17 Pro Max"
                  className="object-contain max-h-80 w-full"
                  loading="lazy"
                />
              </div>

              {/* Product Details */}
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-destructive text-destructive-foreground">
                  {mockProduct.discountPercent}% OFF
                </Badge>
                <h2 className="text-3xl font-bold mb-4">{mockProduct.name}</h2>
                <p className="text-muted-foreground mb-6">
                  {mockProduct.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">
                      {formatCurrency(mockProduct.salePrice)}
                    </span>
                    <span className="text-2xl text-muted-foreground line-through">
                      {formatCurrency(mockProduct.originalPrice)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Save {formatCurrency(mockProduct.savings)} today!
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Stock Status</span>
                    <span
                      className={
                        saleUI.stockBarMuted
                          ? "text-sm text-muted-foreground font-semibold"
                          : "text-sm text-destructive font-semibold"
                      }
                    >
                      {saleUI.stockLabel}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={
                        (saleUI.stockBarMuted
                          ? "bg-muted-foreground/30"
                          : "bg-destructive") + " h-2 rounded-full"
                      }
                      style={{ width: saleUI.stockBarWidth }}
                    ></div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full text-lg"
                  onClick={handlePurchase}
                  disabled={saleUI.buttonDisabled}
                >
                  {saleUI.buttonLabel}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Free shipping • 30-day money-back guarantee
                </p>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
