import React from "react";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  ContentSkeleton,
  type SkeletonVariant,
} from "@/components/ui/loading-skeletons";

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
  /** Shape of the loading skeleton (default "table"). */
  skeleton?: SkeletonVariant;
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

/** Shared loading state: a skeleton shaped like the content it replaces.
 * `loadingText` is announced to screen readers only. */
export const LoadingContent: React.FC<{
  loadingText?: string;
  variant?: SkeletonVariant;
}> = ({ loadingText, variant = "table" }) => (
  <ContentSkeleton variant={variant} label={loadingText} />
);

export const NoContent: React.FC<NoContentPropType> = ({
  message = "No content available",
  onAction,
  actionText = "Refresh",
  showContentBtn,
}) => (
  <Card>
    <CardContent className="p-8 text-center">
      <div className="text-ink-muted">
        <FileText className="mx-auto mb-4 h-12 w-12 text-ink-subtle" />
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
      <Card className="w-full border-none bg-danger-soft text-center shadow">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-danger-strong">
            An Error Occured. Details Below
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-danger-strong">{errorMessage}</p>
          {onAction && (
            <Button
              onClick={onAction}
              className={
                "h-11 w-full cursor-pointer rounded-md bg-danger text-white transition-colors hover:bg-danger"
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
  skeleton = "table",
}) => {
  if (loading) {
    return <LoadingContent loadingText={loadingText} variant={skeleton} />;
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
