import React from "react";
import { FileText, Loader2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentHOCProps {
  loading: boolean;
  error: boolean;
  errorBtnText?: string;
  errMessage?: string;
  noContent: boolean;
  noContentMessage?: string;
  noContentBtnText?: string;
  actionFn?: () => void;
  noContentAction?: () => void;
  children: React.ReactNode;
  loadingText?: string;
  minHScreen?: boolean;
  showContentBtn?: boolean;
}

interface NoContentPropType {
  message?: string;
  onAction?: () => void;
  actionText?: string;
  showContentBtn?: boolean;
}

interface ReqErrProps {
  errorMessage?: string;
  actionText?: string;
  onAction?: () => void;
}

export interface NoContentData {
  message: string;
  actionFn: () => void;
  actionText: string;
}

export const LoadingContent: React.FC<{ loadingText?: string }> = ({
  loadingText,
}) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4 text-gray-500">
          <Loader2 className="h-12 w-12 animate-spin text-gray-300" />
          <h3 className="text-lg font-medium">
            {loadingText || "Loading content..."}
          </h3>
          <div className="mt-6 flex w-full flex-col space-y-3">
            <Skeleton className="mx-auto h-4 w-3/4" />
            <Skeleton className="mx-auto h-4 w-1/2" />
            <Skeleton className="mx-auto h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const NoContent: React.FC<NoContentPropType> = ({
  message = "No content available",
  onAction,
  actionText = "Refresh",
  showContentBtn,
}) => (
  <Card>
    <CardContent className="p-8 text-center">
      <div className="text-gray-500">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium">{message}</h3>
        <p className="text-sm">{"Use the button below for further actions"}</p>
        {showContentBtn && (
          <Button onClick={onAction} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {actionText}
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export const ReqErr: React.FC<ReqErrProps> = ({
  errorMessage = "Something went wrong",
  actionText = "Retry",
  onAction,
}) => {
  return (
    <div className="flex w-full items-center justify-center">
      <Card className="w-full border-none bg-red-50 text-center shadow">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-red-800">
            An Error Occured. Details Below
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-red-700">{errorMessage}</p>
          {onAction && (
            <Button
              onClick={onAction}
              className={
                "h-11 w-full cursor-pointer rounded-lg bg-red-600/80 text-white transition-colors hover:bg-red-600"
              }
            >
              {actionText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const ContentHOC: React.FC<ContentHOCProps> = ({
  loading,
  error,
  errorBtnText = "Retry",
  errMessage = "Something went wrong while fetching content.",
  noContent,
  noContentMessage = "No content found.",
  noContentBtnText = "Refresh",
  noContentAction = () => undefined,
  actionFn,
  loadingText,
  children,
  showContentBtn = true,
}) => {
  if (loading) {
    return <LoadingContent loadingText={loadingText || ""} />;
  }

  if (error) {
    return (
      <ReqErr
        errorMessage={errMessage}
        actionText={errorBtnText}
        onAction={actionFn}
      />
    );
  }

  if (noContent) {
    return (
      <NoContent
        message={noContentMessage}
        actionText={noContentBtnText}
        onAction={noContentAction}
        showContentBtn={showContentBtn}
      />
    );
  }

  return <>{children}</>;
};
