import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  FLASH_SALE_UI_BY_STATUS,
  FlashSaleUIBase,
  SaleStatus,
} from "@/constants/flashSaleUI";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useToast } from "@/hooks/use-toast";
import { Zap, Package, LogOut } from "lucide-react";

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // TODO: Wire these from API. For now, mock status and times.
  const [saleStatus] = useState<SaleStatus>("active");

  const saleStartTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // starts in 2h
  const saleEndTime = new Date(Date.now() + 6 * 60 * 60 * 1000); // ends in 6h

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
    const base = FLASH_SALE_UI_BY_STATUS[saleStatus];
    const buttonLabel = getButtonLabel(base);
    const timerEndTime = base.useStartTime ? saleStartTime : saleEndTime;
    return { ...base, buttonLabel, timerEndTime } as const;
  }, [saleStatus, saleStartTime, saleEndTime, user]);

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
        <div className="flex justify-end mb-8">
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
        <div className="text-center mb-12">
          <Badge className="mb-4 text-lg px-6 py-2 bg-accent text-accent-foreground animate-pulse">
            <Zap className="mr-2 h-5 w-5" />
            {saleUI.badgeText}
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {saleUI.headingText}
          </h1>
          {saleUI.showTimer && (
            <>
              <p className="text-xl text-muted-foreground mb-8">
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
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-12">
                <Package className="h-48 w-48 text-primary" />
              </div>

              {/* Product Details */}
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-destructive text-destructive-foreground">
                  70% OFF
                </Badge>
                <h2 className="text-3xl font-bold mb-4">Premium Product</h2>
                <p className="text-muted-foreground mb-6">
                  Experience the ultimate quality with our premium product.
                  Limited stock available during this flash sale!
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">
                      $29.99
                    </span>
                    <span className="text-2xl text-muted-foreground line-through">
                      $99.99
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Save $70.00 today!
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
